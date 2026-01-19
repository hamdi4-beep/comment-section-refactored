# Interactive Comment Section

A React-based comment system with nested replies, voting, and CRUD operations.

## Features

- **Threaded Replies**: Nested comment structure with 1-2 levels of depth
- **Vote System**: Upvote/downvote functionality with score tracking
- **CRUD Operations**: Create, edit, and delete comments
- **Auto-sorting**: Comments sorted by score in descending order

## Component Structure

```
App.jsx              # Main container, manages comment state
├── Comment.jsx      # Recursive comment component
└── FormComponent.jsx # Handles comment/reply creation and editing
```

## Get Started

```bash
npm install
npm run dev
```

## Usage Examples

**Creating a new comment:**

```javascript
const createComment = content => {
  const newComment = {
    id: crypto.randomUUID(),
    content,
    createdAt: "just now",
    score: 0,
    user: { /* user data */ },
    replies: []
  }
  setComments(prev => [...prev, newComment])
}
```

**Updating nested comment data:**

```javascript
const createUpdatedComment = (tree, target, props) =>
  tree.map(item => {
    if (item.id === target.id)
      return Object.assign({}, item, props)
    
    if (item.replies?.some(reply => reply.id === target.id))
      return Object.assign({}, item, {
        replies: createUpdatedComment(item.replies, target, props)
      })
    
    return item
  })
```

**Adding a reply to a comment:**

```javascript
updateComments(prev =>
  createUpdatedComment(prev, targetComment, {
    replies: targetComment.replies.concat(newReply)
  })
)
```

## State Management

Comments are stored in a flat array with nested `replies` arrays. All updates use immutable state transformations through the `createUpdatedComment` helper function.

## Key Implementation Details

- Uses `crypto.randomUUID()` for unique IDs
- Vote tracking prevents multiple consecutive votes via `useRef`
- Recursive rendering for nested replies
- Modal confirmation for deletions
- Form state toggles between replying/editing modes

## Data Structure

```typescript
{
  id: string
  content: string
  createdAt: string
  score: number
  user: { username: string, image: { png: string, webp: string } }
  replies: Comment[]
  replyingTo?: string
}
```
