# Comment Section

A self-contained interactive comment section built with React. Supports nested replies, voting, editing, and deletion — all managed through a single custom hook.

---

## Architecture

State and mutations live entirely in `useComments` (`src/hooks.ts`), which exposes a `comments` array and an `actions` object to the rest of the app. Components receive both as props and never reach outside them — they either render data or call an action.

```
App
├── useComments()        ← owns all comment state and mutations
├── Comment              ← recursive; renders a comment and its replies
│   ├── ScoreComponent   ← voting UI with local vote-direction state
│   └── FormComponent    ← shared form for new comments, replies, and edits
└── FormComponent        ← bottom-of-page form for new top-level comments
```

The three layers have distinct responsibilities:

- **Data layer** (`types/comment/types.ts`) — defines the shape of a comment and the actions interface
- **Hook layer** (`hooks.ts`) — owns comment state; exposes only an opaque `actions` object to consumers
- **Presentation layer** (`components/`) — renders data and delegates mutations upward via `actions`

---

## Data Model

```ts
interface Comment {
  id: string
  parentId: string | null   // null for top-level; points to the top-level parent for replies
  content: string
  createdAt: string
  score: number
  replyingTo: string | null // username being replied to, null for top-level
  user: { username: string; image: { png: string; webp: string } }
  replies: Comment[] | null // array for top-level comments, null for replies
}
```

Nesting is intentionally shallow — replies-to-replies are still stored under the original top-level comment rather than recursively nested. `parentId` always points to a top-level comment, which keeps traversal in the hook straightforward: one level of recursion covers all cases.

---

## `useComments` Hook

```ts
const { comments, actions } = useComments(initialData)
```

Initialises comment state from `initialData` and returns it alongside an `actions` object. All mutations produce a new state array — nothing is mutated in place.

### Actions

| Action | Signature | Description |
|---|---|---|
| `createComment` | `(content) => void` | Appends a new top-level comment |
| `createReply` | `(parentId, id, replyingTo, content) => void` | Appends a reply to a top-level comment. When replying to a nested reply, `parentId` is used to find the correct parent |
| `editComment` | `(parentId, id, content) => void` | Updates the `content` field of a comment or reply |
| `deleteComment` | `(parentId, id) => void` | Removes a comment. Passes `null` as `parentId` for top-level deletions |
| `updateScore` | `(parentId, id, delta) => void` | Adds `delta` (+1 or -1) to a comment's score |

---

## Components

### `Comment`

Recursive component. Renders a comment card, then maps over `comment.replies` — each rendered with another `Comment` — producing the nested reply list.

`formStatus` local state (`null | 'replying' | 'editing'`) controls which inline form is visible at a time. Only one can be open per comment instance.

User permissions are simulated by comparing `comment.user.username` against a hardcoded string (`'juliusomo'`). Comments belonging to the current user show Edit and Delete; all others show Reply.

Deletion goes through a confirmation modal rather than firing immediately. The modal renders inline and a CSS `::after` pseudo-element on `body` provides the backdrop via `:has(.delete-modal)`.

### `FormComponent`

Used in three contexts:

| Context | `value` prop | `onSubmit` callback |
|---|---|---|
| New top-level comment | `''` (default) | `actions.createComment` |
| Reply | `''` (default) | `handleReplySubmit` → `actions.createReply` |
| Edit | Pre-filled with existing content | `handleEditSubmit` → `actions.editComment` |

Uses React 19's form action API (`<form action={asyncFn}>`). Submission is a no-op if the textarea is empty.

### `ScoreComponent`

Holds its own `voteStatus` state (`null | 'up' | 'down'`) to prevent voting in the same direction twice. This state is local and ephemeral — it resets if the component unmounts. The actual score lives in the hook.

---

## Sorting

Comments are sorted by score descending at render time in `App`, not stored pre-sorted in state. This means the order updates reactively whenever a score changes.

```ts
const sortedComments = [...comments].sort((a, b) => b.score - a.score)
```
