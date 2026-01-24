import * as React from 'react'
import data from '../data/comments.json'
import Comment from './components/Comment'
import FormComponent from './components/FormComponent'

const updateComment = (tree, target, props) =>
  tree.map(item => {
    if (item.id === target.id)
      return Object.assign({}, item, props)

    if (item.replies && item.replies.some(reply => reply.id === target.id))
      return Object.assign({}, item, {
        replies: updateComment(item.replies, target, props)
      })

    return item
  })

function App() {
  const [comments, setComments] = React.useState(data)
  const sortedComments = [...comments].sort((a, b) => b.score - a.score)

  const commentActions = {
    createComment(content) {
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
    },
    createReply(comment, parentComment, content) {
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
        updateComment(prev, targetComment, {
          replies: targetComment.replies.concat(newReply)
        })
      )
    },
    deleteComment(comment, parentComment) {
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
    },
    incrementScore(comment, currentScore) {
      setComments(prev =>
        updateComment(prev, comment, {
          score: currentScore >= comment.score ? comment.score + 1 : comment.score
        })
      )
    },
    decrementScore(comment, currentScore) {
      setComments(prev =>
        updateComment(prev, comment, {
          score: currentScore <= comment.score ? comment.score - 1 : comment.score
        })
      )
    },
    updateContent(comment, content) {
      setComments(prev =>
        updateComment(prev, comment, {
          content
        })
      )
    }
  }

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