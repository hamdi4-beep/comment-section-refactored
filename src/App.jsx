import data from '../data/comments.json'
import Comment from './components/Comment'
import FormComponent from './components/FormComponent'
import { useComments } from './hooks'

function App() {
  const {comments, commentActions} = useComments(data)
  const sortedComments = [...comments].sort((a, b) => b.score - a.score)

  return (
    <div className="App">
      <div className="comment-list">
        {sortedComments.map(parentComment => (
          <Comment
            key={parentComment.id}
            comment={parentComment}
            parentComment={null}
            commentActions={commentActions}
          />
        ))}
      </div>

      <FormComponent onSubmit={commentActions.createComment} />
    </div>
  )
}

export default App