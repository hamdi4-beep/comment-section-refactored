# Interactive Comments Section

A React application featuring a nested comment system with voting, replies, editing, and deletion capabilities.

## Features

- **Voting System**: Upvote/downvote comments with score tracking
- **Nested Replies**: Reply to comments with threaded display
- **Comment Management**: Edit and delete your own comments
- **User Authentication**: Demo authentication to distinguish current user
- **Inline Editing**: Edit comments directly within the interface
- **Delete Confirmation**: Modal confirmation before removing comments

## Project Structure

```
src/
├── components/
│   ├── Comment.jsx          # Thread container for parent + replies
│   ├── CommentCard.jsx      # Individual comment display & actions
│   ├── CommentsList.jsx     # Top-level comments list
│   └── FormComponent.jsx    # Reusable form for new/edited comments
├── utils/
│   └── commentUtils.js      # Helper for immutable comment updates
└── css/
    └── index.css            # Global styles
```

## State Management

The app uses local component state with immutable updates. Parent comments and their replies are managed together, with changes propagated through the `updateParentComment` callback pattern.

## Data Structure

Comments are loaded from `data/comments.json` with the following shape:

```javascript
{
  id: string,
  content: string,
  createdAt: string,
  score: number,
  user: { username: string, image: object },
  replies: Comment[],
  replyingTo?: string  // for nested replies
}
```

## Running the Project

```bash
npm install
npm run dev
```
