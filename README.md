# Interactive Comment Section

A React-based threaded comment system demonstrating state management, recursive rendering, and immutable data patterns. Built with React 19, Vite, and vanilla CSS.

**[Live Demo](https://hamdi4-beep.github.io/comment-section-refactored)**

---

## Features

- **Threaded Discussions**: Unlimited nesting depth with recursive rendering
- **Vote System**: Upvote/downvote with spam prevention
- **CRUD Operations**: Create, reply, edit, and delete comments
- **Auto-Sorting**: Comments sorted by score (highest first)
- **Responsive Design**: Mobile-optimized layout

---

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool
- **Vitest** - Testing framework
- **Vanilla CSS** - Styling (no framework dependencies)

---

## Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/hamdi4-beep/comment-section-refactored.git
cd comment-section-refactored

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173`

### Build for Production
```bash
pnpm build      # Creates dist/ folder
pnpm preview    # Preview production build
```

### Deploy to GitHub Pages
```bash
pnpm deploy
```

---

## Project Structure
```
src/
├── App.jsx                 # Root component
├── components/
│   ├── Comment.jsx         # Recursive comment renderer
│   └── FormComponent.jsx   # Reusable input form
├── hooks.js                # useComments custom hook
├── css/
│   └── index.css           # Global styles
├── test/                   # Test files
└── main.jsx                # React entry point

data/
└── comments.json           # Initial comment data

public/
└── images/                 # Icons and avatars
```

---

## Architecture

### State Management

All comment operations are centralized in the `useComments` hook (`src/hooks.js`):
```javascript
const {comments, actions} = useComments(data)
```

**Available Actions:**
- `createComment(content)` - Add top-level comment
- `createReply(parentId, id, username, content)` - Add reply
- `deleteComment(parentId, id)` - Remove comment/reply
- `incrementScore(parentId, id, score, currentScore)` - Upvote
- `decrementScore(parentId, id, score, currentScore)` - Downvote
- `editComment(parentId, id, content)` - Update comment text

### Data Model

Comments use a nested structure where replies are stored in a `replies` array:
```javascript
{
  id: string,
  content: string,
  createdAt: string,
  score: number,
  user: { username, image },
  replies: Comment[],      // Recursive nesting
  replyingTo?: string      // Only present in replies
}
```

### Immutable Updates

Tree operations use functional patterns to ensure React detects changes:
```javascript
const updateComment = (tree, parentId, id, props) =>
  tree.map(comment => {
    if (comment.id === id)
      return Object.assign({}, comment, props)
    
    if (comment.id === parentId)
      return Object.assign({}, comment, {
        replies: updateComment(comment.replies, parentId, id, props)
      })
    
    return comment
  })
```

---

## Testing
```bash
pnpm test              # Run tests
pnpm test:ui           # Open Vitest UI
pnpm test:coverage     # Generate coverage report
```

**Test Coverage:**
- Component tests (`Comment.test.jsx`, `FormComponent.test.jsx`)
- Hook tests (`hooks.test.js`)
- Integration tests (`App.test.jsx`)

---

## Known Limitations

1. **No Persistence**: Data resets on page reload (client-only, no backend)
2. **Mock Authentication**: Uses hardcoded username (`juliusomo`)
3. **No Real-Time Updates**: Single-user experience
4. **Performance**: Full tree re-renders on state changes (no memoization)

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Author

**Hamdi** - [GitHub](https://github.com/hamdi4-beep)

---

## Acknowledgments

- Challenge from [Frontend Mentor](https://www.frontendmentor.io)
- Design assets provided by Frontend Mentor
- Built as a portfolio demonstration piece
