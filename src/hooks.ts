import * as React from 'react'
import type { Comment } from './components/Comment'

export interface Actions {
  createComment: (content: Comment['content']) => void
  createReply: (parentId: Comment['parentId'], id: Comment['id'], username: Comment['replyingTo'], content: Comment['content']) => void
  deleteComment: (parentId: Comment['parentId'], id: Comment['id']) => void
  editComment: (parentId: Comment['parentId'], id: Comment['id'], content: Comment['content']) => void
  updateScore: (parentId: Comment['parentId'], id: Comment['id'], score: Comment['score'], delta: number) => void
}

const updateComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id'], props: Partial<Comment>) =>
  state.map((comment): Comment => {
    if (comment.id === parentId)
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
    if (comment.id === id)
      return {
        ...comment,
        replies: comment.replies.concat(reply)
      }

    return comment
  })

const filterComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id']) =>
  state
    .filter(comment => comment.id !== id)
    .map(comment => {
      if (comment.id === parentId)
        return {
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== id)
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
      const newComment = {
        parentId: null,
        id: crypto.randomUUID(),
        content,
        createdAt: "just now",
        score: 0,
        replyingTo: null,
        user: currentUser,
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
        user: currentUser,
        replies: []
      }

      setComments(prev => addReply(prev, targetId, newReply))
    },
    deleteComment(parentId, id) {
      setComments(prev => filterComment(prev, parentId, id))
    },
    updateScore(parentId, id, score, delta) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
          score: score + delta
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