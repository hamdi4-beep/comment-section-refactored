# Interactive Comment Section

A React-based comment system with nested replies, voting, and CRUD operations.

## Features

- Create, edit, and delete comments
- Reply to comments (one level of nesting)
- Upvote/downvote with score tracking
- Sort comments by score
- Modal confirmation for deletions
- Responsive design

## Technical Implementation

**State Management**: Uses `useState` with immutable updates. State lives in `App.jsx` and flows down through props.

**Component Structure**:
- `App.jsx` - Main component, manages comment state
- `Comment.jsx` - Handles individual comment rendering and interactions
- `FormComponent.jsx` - Reusable form for creating/editing comments
- `commentUtils.js` - Pure utility function for nested state updates

**Key Patterns**:
- Functional state updates for nested data
- Component-level update logic rather than centralized reducer
- Uncontrolled form components with native HTML validation
- UUID-based ID generation via `crypto.randomUUID()`

## Data Structure

```javascript
{
  id: string,
  content: string,
  createdAt: string,
  score: number,
  user: { username, image },
  replies: [/* nested reply objects */]
}
```

Comments contain an array of replies. Updates traverse this structure to find and modify specific items while maintaining immutability.

## Running Locally

```bash
npm install
npm run dev
```

## Known Limitations

- Single level of reply nesting only
- No persistence (state resets on refresh)
- Comments re-sort on every render