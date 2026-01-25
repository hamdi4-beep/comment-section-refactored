import * as React from 'react'

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

const filterComment = (tree, comment, parentComment) => {
  if (parentComment)
    return updateComment(tree, parentComment, {
      replies: parentComment.replies.filter(reply => reply.id !== comment.id)
    })

  return tree.filter(item => item.id !== comment.id)
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
        updateComment(prev, targetComment, {
          replies: targetComment.replies.concat(newReply)
        })
      )
    },
    deleteComment(comment, parentComment) {
      setComments(prev => filterComment(prev, comment, parentComment))
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

  return {
    comments,
    commentActions
  }
}