import data from '../data/comments.json'
import Comment from './components/Comment'
import FormComponent from './components/FormComponent'
import { useComments } from './hooks'

function App() {
  const {comments, actions} = useComments(data)
  const sortedComments = [...comments].sort((a, b) => b.score - a.score)

  return (
    <div className="App">
      <div className="comment-list">
        {sortedComments.map(comment => (
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