import * as React from 'react'

const updateComment = (tree, target, props) =>
  tree.map(item => {
    if (item.id === target.id)
      return Object.assign({}, item, props)

    if (item.id === target.parentId)
      return Object.assign({}, item, {
        replies: updateComment(item.replies, target, props)
      })

    return item
  })

const filterComment = (tree, targetItem) =>
  tree
    .filter(item => item.id !== targetItem.id)
    .map(item => {
      if (item.id === targetItem.parentId) {
        return Object.assign({}, item, {
          replies: item.replies.filter(it => it.id !== targetItem.id)
        })
      }

      return item
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
    createReply(comment, parentComment, content) {
      const targetComment = parentComment || comment

      const newReply = {
        parentId: targetComment.id,
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