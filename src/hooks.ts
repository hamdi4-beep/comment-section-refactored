import * as React from 'react'
import type { Comment, Actions } from './types/shared/comment/types'

const updateComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id'], props: Partial<Comment>) =>
  state.map((comment): Comment => {
    // updates a parent comment if that's where the targeted reply is located
    if (comment.id === parentId && comment.replies)
      return {
        ...comment,
        replies: updateComment(comment.replies, parentId, id, props)
      }

    if (comment.id === id)
      return {
        ...comment,
        ...props
      }

    return comment
  })

const addReply = (state: Comment[], id: Comment['id'], reply: Comment) =>
  state.map(comment => {
    if (comment.id === id && comment.replies)
      return {
        ...comment,
        replies: comment.replies.concat(reply)
      }

    return comment
  })

const filterComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id']) => {
  if (parentId)
    return state.map(comment => {
      if (comment.id === parentId && comment.replies)
        return {
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== id)
        }

      return comment
    })

  return state.filter(comment => comment.id !== id)
}

const voteComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id'], delta: number) =>
  state.map((comment): Comment => {
    if (comment.id === parentId && comment.replies)
      return {
        ...comment,
        replies: voteComment(comment.replies, parentId, id, delta)
      }

    if (comment.id === id)
      return {
        ...comment,
        score: comment.score + delta
      }

    return comment
  })

const currentUser = {
  image: { 
    png: "/images/avatars/image-juliusomo.png",
    webp: "/images/avatars/image-juliusomo.webp"
  },
  username: "juliusomo"
}

export function useComments(data: Comment[]) {
  const [comments, setComments] = React.useState(data)

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
      setComments(state => voteComment(state, parentId, id, delta))
    },
    editComment(parentId, id, content) {
      setComments(state =>
        updateComment(state, parentId, id, {
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