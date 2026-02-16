import * as React from 'react'

const updateComment = (tree, parentId, id, props) =>
  tree.map(comment => {
    if (comment.id === id)
      return Object.assign({}, comment, props)

    if (comment.id === parentId)
      return Object.assign({}, comment, {
        replies: updateComment(comment.replies, parentId, id, props)
      })

    return comment
  })

const createReply = (tree, id, reply) =>
  tree.map(comment => {
    if (comment.id === id)
      return Object.assign({}, comment, {
        replies: comment.replies.concat(reply)
      })

    return comment
  })

const filterComment = (tree, parentId, id) =>
  tree
    .filter(comment => comment.id !== id)
    .map(comment => {
      if (comment.id === parentId) {
        return Object.assign({}, comment, {
          replies: comment.replies.filter(reply => reply.id !== id)
        })
      }

      return comment
    })

export function useComments(data) {
  const [comments, setComments] = React.useState(data)

  const actions = {
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
    createReply(parentId, id, username, content) {
      const targetId = parentId || id

      const newReply = {
        parentId: targetId,
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo: username,
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
    deleteComment(parentId, id) {
      setComments(prev => filterComment(prev, parentId, id))
    },
    incrementScore(parentId, id, score, currentScore) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
          score: currentScore >= score ? score + 1 : score
        })
      )
    },
    decrementScore(parentId, id, score, currentScore) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
          score: currentScore <= score ? score - 1 : score
        })
      )
    },
    editComment(parentId, id, content) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
          content
        })
      )
    }
  }

  return {
    comments,
    actions
  }
}