import * as React from 'react'
import data from '../data/comments.json'
import Comment from './components/Comment'
import FormComponent from './components/FormComponent'

const createUpdatedComment = (tree, target, props) =>
  tree.map(item => {
    if (item.id === target.id)
      return Object.assign({}, item, props)

    if (item.replies && item.replies.some(reply => reply.id === target.id))
      return Object.assign({}, item, {
        replies: createUpdatedComment(item.replies, target, props)
      })

    return item
  })

function App() {
  const [comments, setComments] = React.useState(data)
  const sortedComments = [...comments].sort((a, b) => b.score - a.score)

  const createComment = content => {
    const newComment = {
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
    }

    setComments(prev => [...prev, newComment])
  }

  const incrementScore = (comment, currentScore) =>
    setComments(prev =>
      createUpdatedComment(prev, comment, {
        score: currentScore >= comment.score ? comment.score + 1 : comment.score
      })
    )

  const decrementScore = (comment, currentScore) =>
    setComments(prev =>
      createUpdatedComment(prev, comment, {
        score: currentScore <= comment.score ? comment.score - 1 : comment.score
      })
    )

  const updateContent = (comment, content) =>
    setComments(prev =>
      createUpdatedComment(prev, comment, {
        content
      })
    )

  const deleteComment = (comment, parentComment) =>
    setComments(prev => {
      if (!parentComment)
        return prev.filter(item => item.id !== comment.id)
      
      return prev.map(item => {
        if (item.id === parentComment.id)
          return Object.assign({}, item, {
            replies: item.replies.filter(reply => reply.id !== comment.id)
          })

        return item
      })
    })

  const createReply = (comment, parentComment, content) => {
    const targetComment = parentComment ?? comment

    const newReply = {
      id: crypto.randomUUID(),
      content,
      createdAt: "just now",
      score: 0,
      replyingTo: comment.user.username,
      user: {
        image: { 
          png: "/images/avatars/image-juliusomo.png",
          webp: "/images/avatars/image-juliusomo.webp"
        },
        username: "juliusomo"
      }
    }

    setComments(prev =>
      createUpdatedComment(prev, targetComment, {
        replies: targetComment.replies.concat(newReply)
      })
    )
  }

  return (
    <div className="App">
      <div className="comment-list">
        {sortedComments.map(parentComment => (
          <Comment
            key={parentComment.id}
            comment={parentComment}
            parentComment={null}
            incrementScore={incrementScore}
            decrementScore={decrementScore}
            createReply={createReply}
            updateContent={updateContent}
            deleteComment={deleteComment}
          />
        ))}
      </div>

      <FormComponent onSubmit={createComment} />
    </div>
  )
}

export default App