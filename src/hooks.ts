import * as React from 'react'
import type { Comment, Actions } from './types/comment/types'
import data from '../data/comments.json'

function updateComment(state: Comment[], id: Comment['id'], updater: (comment: Comment) => Comment) {
  const update = (comments: Comment[]): Comment[] =>
    comments.map(comment => {
      if (comment.id === id) return updater(comment)

      if (comment.replies.length > 0) {
        const replies = update(comment.replies)
        return comment.replies.some((r, i) => r !== replies[i]) ? {...comment, replies} : comment
      }

      return comment
    })

  return update(state)
}

// const updateComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id'], updater: (comment: Comment) => Comment) =>
//   state.map((comment): Comment =>
//     comment.id === parentId && comment.replies ? {...comment, replies: updateComment(comment.replies, parentId, id, updater)} :
//       comment.id === id ? updater(comment) : comment
//   )

const filterComment = (state: Comment[], id: Comment['id']) => {
  const filter = (comments: Comment[]): Comment[] => {
    const filtered = comments.filter(comment => comment.id !== id)

    if (filtered.length !== state.length) return filtered

    return comments.map(comment => {
      if (comment.replies.length > 0) {
        const replies = filter(comment.replies)
        return comment.replies.some((r, i) => r !== replies[i]) ? {...comment, replies} : comment
      }

      return comment
    })
  }

    return filter(state)
}

const currentUser = {
  image: { 
    png: "/images/avatars/image-juliusomo.png",
    webp: "/images/avatars/image-juliusomo.webp"
  },
  username: "juliusomo"
}

export function useComments() {
  const [comments, setComments] = React.useState<Comment[]>(data)

  const actions = React.useMemo<Actions>(() => ({
    createComment(content) {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo: null,
        user: currentUser,
        replies: []
      }

      setComments(state => [...state, newComment])
    },
    createReply(id, replyingTo, content) {
      const newReply: Comment = {
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo,
        user: currentUser,
        replies: []
      }

      setComments(state =>
        updateComment(state, id, comment => ({
          ...comment,
          replies: comment.replies.concat(newReply)
        }))
      )
    },
    deleteComment(id) {
      setComments(state => filterComment(state, id))
    },
    updateScore(id, delta) {
      const scoreUpdate = (comment: Comment) => ({
          ...comment,
          score: comment.score + delta
        })

      setComments(state => updateComment(state, id, scoreUpdate))
    },
    editComment(id, content) {
      const contentUpdate = (comment: Comment) => ({
          ...comment,
          content
        })

      setComments(state =>
        updateComment(state, id, contentUpdate)
      )
    }
  }), [])

  return {
    comments: [...comments].sort((a, b) => b.score - a.score),
    actions
  }
}