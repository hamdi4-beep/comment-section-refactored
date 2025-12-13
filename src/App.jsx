import Comment from './components/Comment'
import comments from '../data/comments.json'

function App() {
  return (
    <div className="App">
      <div className="comments-list">
        {comments.map(comment => (
          <Comment
            parentComment={comment}
            key={comment.id}
          />
        ))}
      </div>
    </div>
  )
}

export default App