import * as React from 'react'

const updateComment = (tree, parentId, id, props) =>
  tree.map(node => {
    if (node.id === id)
      return Object.assign({}, node, props)

    if (node.id === parentId)
      return Object.assign({}, node, {
        replies: updateComment(node.replies, parentId, id, props)
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

const filterComment = (tree, parentId, id) =>
  tree
    .filter(node => node.id !== id)
    .map(node => {
      if (node.id === parentId) {
        return Object.assign({}, node, {
          replies: node.replies.filter(reply => reply.id !== id)
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
    updateContent(parentId, id, content) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
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