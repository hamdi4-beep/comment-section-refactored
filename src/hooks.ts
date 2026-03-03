import * as React from 'react'
import type { Comment, Actions } from './types/comment/types'
import data from '../data/comments.json'

const updateComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id'], updater: (comment: Comment) => Comment) =>
  state.map((comment): Comment =>
    comment.id === parentId && comment.replies ? {...comment, replies: updateComment(comment.replies, parentId, id, updater)} :
      comment.id === id ? updater(comment) : comment
  )

const addReply = (state: Comment[], id: Comment['id'], reply: Comment) =>
  state.map(comment =>
    comment.id === id && comment.replies ?
      {...comment, replies: comment.replies.concat(reply)} : comment
  )

const filterComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id']) =>
  parentId ?
    state.map(comment =>
      comment.id === parentId && comment.replies ?
        {...comment, replies: comment.replies.filter(reply => reply.id !== id)} : comment
    ) : state.filter(comment => comment.id !== id)

const currentUser = {
  image: { 
    png: "/images/avatars/image-juliusomo.png",
    webp: "/images/avatars/image-juliusomo.webp"
  },
  username: "juliusomo"
}

export function useComments() {
  const [comments, setComments] = React.useState<Comment[]>(data)

  const actions: Actions = {
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
    createReply(parentId, id, replyingTo, content) {
      const targetId = parentId || id

      const newReply: Comment = {
        parentId: targetId,
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo,
        user: currentUser,
        replies: null
      }

      setComments(state => addReply(state, targetId, newReply))
    },
    deleteComment(parentId, id) {
      setComments(state => filterComment(state, parentId, id))
    },
    updateScore(parentId, id, delta) {
      const scoreUpdate = (comment: Comment) => ({
          ...comment,
          score: comment.score + delta
        })

      setComments(state => updateComment(state, parentId, id, scoreUpdate))
    },
    editComment(parentId, id, content) {
      const contentUpdate = (comment: Comment) => ({
          ...comment,
          content
        })

      setComments(state =>
        updateComment(state, parentId, id, contentUpdate)
      )
    }
  }

  return {
    comments: [...comments].sort((a, b) => b.score - a.score),
    actions
  }
}