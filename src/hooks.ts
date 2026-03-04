import * as React from 'react'
import type { Comment, Actions } from './types/comment/types'
import data from '../data/comments.json'

const updateComment = (state: Comment[], id: Comment['id'], updater: (comment: Comment) => Comment) =>
  state.map(comment =>
    comment.id === id ? updater(comment) : comment
  )

const filterComment = (state: Comment[], id: Comment['id']) =>
  state.filter(comment => comment.id !== id)

const currentUser = {
  image: { 
    png: "/images/avatars/image-juliusomo.png",
    webp: "/images/avatars/image-juliusomo.webp"
  },
  username: "juliusomo"
}

const buildTree = (comments: Comment[]) => {
  const map = new Map(comments.map(comment => [comment.id, {...comment, replies: [] as Comment[]}]))
  const roots = [] as Comment[]

  map.forEach(comment => {
    if (!comment.parentId) {
      roots.push(comment)
    } else {
      const parentComment = map.get(comment.parentId)!
      parentComment.replies.push(comment)
    }
  })

  return roots
}

export function useComments() {
  const [comments, setComments] = React.useState<Comment[]>(data)

  const actions = React.useMemo<Actions>(() => ({
    createComment(content) {
      const newComment: Comment = {
        parentId: null,
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
    createReply(parentId, replyingTo, content) {
      const newReply: Comment = {
        parentId,
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo,
        user: currentUser,
        replies: []
      }

      setComments(state => [...state, newReply])
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
    comments: buildTree(comments),
    actions
  }
}