import * as React from 'react'

const updateComment = (tree, target, props) =>
  tree.map(node => {
    if (node.id === target.id)
      return Object.assign({}, node, props)

    if (node.id === target.parentId)
      return Object.assign({}, node, {
        replies: updateComment(node.replies, target, props)
      })

    return node
  })

const createReply = (tree, targetId, reply) =>
  tree.map(node => {
    if (node.id === targetId)
      return Object.assign({}, node, {
        replies: node.replies.concat(reply)
      })

    return node
  })

const filterComment = (tree, target) =>
  tree
    .filter(node => node.id !== target.id)
    .map(node => {
      if (node.id === target.parentId) {
        return Object.assign({}, node, {
          replies: node.replies.filter(reply => reply.id !== target.id)
        })
      }

      return node
    })

export function useComments(data) {
  const [comments, setComments] = React.useState(data)

  const commentActions = {
    createComment(content) {
      const newComment = {
        parentId: null,
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
    createReply(comment, content) {
      const targetId = comment.parentId || comment.id

      const newReply = {
        parentId: targetId,
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

      setComments(prev => createReply(prev, targetId, newReply))
    },
    deleteComment(comment) {
      setComments(prev => filterComment(prev, comment))
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