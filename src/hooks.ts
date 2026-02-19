import * as React from 'react'
import type { Comment } from './components/Comment'

export interface Actions {
  createComment: (content: Comment['content']) => void
  createReply: (parentId: Comment['parentId'], id: Comment['id'], replyingTo: Comment['replyingTo'], content: Comment['content']) => void
  deleteComment: (parentId: Comment['parentId'], id: Comment['id']) => void
  editComment: (parentId: Comment['parentId'], id: Comment['id'], content: Comment['content']) => void
  updateScore: (parentId: Comment['parentId'], id: Comment['id'], currentScore: Comment['score'], delta: number) => void
}

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

const filterComment = (state: Comment[], parentId: Comment['parentId'], id: Comment['id']) =>
  state
    .filter(comment => comment.id !== id)
    .map(comment => {
      if (comment.id === parentId && comment.replies)
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

      setComments(prev => [...prev, newComment])
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

      setComments(prev => addReply(prev, targetId, newReply))
    },
    deleteComment(parentId, id) {
      setComments(prev => filterComment(prev, parentId, id))
    },
    updateScore(parentId, id, currentScore, delta) {
      setComments(prev =>
        updateComment(prev, parentId, id, {
          score: currentScore + delta
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