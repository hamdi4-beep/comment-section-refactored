import * as React from 'react'

const updateComment = (tree, targetId, props) =>
  tree.map(item => {
    if (item.id === targetId)
      return Object.assign({}, item, props)

    if (item.replies && item.replies.some(reply => reply.id === targetId))
      return Object.assign({}, item, {
        replies: updateComment(item.replies, targetId, props)
      })

    return item
  })

const filterComment = (tree, targetId, parentComment) => {
  if (parentComment)
    return updateComment(tree, parentComment.id, {
      replies: parentComment.replies.filter(reply => reply.id !== targetId)
    })

  return tree.filter(item => item.id !== targetId)
}

export function useComments(data) {
  const [comments, setComments] = React.useState(data)

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
        updateComment(prev, targetComment.id, {
          replies: targetComment.replies.concat(newReply)
        })
      )
    },
    deleteComment(comment, parentComment) {
      setComments(prev => filterComment(prev, comment.id, parentComment))
    },
    incrementScore(comment, currentScore) {
      setComments(prev =>
        updateComment(prev, comment.id, {
          score: currentScore >= comment.score ? comment.score + 1 : comment.score
        })
      )
    },
    decrementScore(comment, currentScore) {
      setComments(prev =>
        updateComment(prev, comment.id, {
          score: currentScore <= comment.score ? comment.score - 1 : comment.score
        })
      )
    },
    updateContent(comment, content) {
      setComments(prev =>
        updateComment(prev, comment.id, {
          content
        })
      )
    }
  }

  return {
    comments,
    commentActions
  }
}