import { useState } from 'react'
import data from '../data/comments.json'
import Comment from './components/Comment'
import FormComponent from './components/FormComponent'

function App() {
  const [comments, setComments] = useState(data)
  const sortedComments = [...comments].sort((a, b) => b.score - a.score)

  const createComment = content =>
    setComments(prev =>
      [...prev, {
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        user: {
          image: { 
            png: "/images/avatars/image-juliusomo.png",
            webp: "/images/avatars/image-juliusomo.webp"
          },
          username: "juliusomo"
        },
        replies: []
      }]
    )

  return (
    <div className="App">
      <div className="comment-list">
        {sortedComments.map(parentComment => (
          <div key={parentComment.id}>
            <Comment
              comment={parentComment}
              parentComment={null}
              updateComments={setComments}
            />

            <div className="reply-list">
              {parentComment.replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  parentComment={parentComment}
                  updateComments={setComments}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <FormComponent triggerUpdate={createComment} />
    </div>
  )
}

export default App