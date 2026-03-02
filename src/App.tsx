import Comment from './components/Comment'
import FormComponent from './components/FormComponent'
import { useComments } from './hooks'

function App() {
  const {comments, actions} = useComments()

  return (
    <div className="App">
      <div className="comment-list">
        {comments.map(comment => (
          <Comment
            key={comment.id}
            comment={comment}
            actions={actions}
          />
        ))}
      </div>

      <FormComponent onSubmit={actions.createComment} />
    </div>
  )
}

export default App