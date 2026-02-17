import * as React from 'react'
import type { Comment } from './components/Comment'

export interface Actions {
  createComment: (content: string) => void
  createReply: (parentId: Comment['parentId'], id: Comment['id'], username: Comment['replyingTo'], content: Comment['content']) => void
  deleteComment: (parentId: Comment['parentId'], id: Comment['id']) => void
  editComment: (parentId: Comment['parentId'], id: Comment['id'], content: Comment['content']) => void
  incrementScore: (parentId: Comment['parentId'], id: Comment['id'], score: Comment['score'], currentScore: Comment['score']) => void
  decrementScore: (parentId: Comment['parentId'], id: Comment['id'], score: Comment['score'], currentScore: Comment['score']) => void
}

const updateComment = (tree: Comment[], parentId: Comment['parentId'], id: Comment['id'], props: Partial<Comment>) =>
  tree?.map((comment): Comment => {
    if (comment.id === id)
      return Object.assign({}, comment, props)

    if (comment.id === parentId)
      return Object.assign({}, comment, {
        replies: updateComment(comment.replies!, parentId, id, props)
      })

    return comment
  })

const createReply = (tree: Comment[], id: Comment['id'], reply: Comment) =>
  tree.map(comment => {
    if (comment.id === id)
      return Object.assign({}, comment, {
        replies: comment.replies?.concat(reply)
      })

    return comment
  })

const filterComment = (tree: Comment[], parentId: Comment['parentId'], id: Comment['id']) =>
  tree
    .filter(comment => comment.id !== id)
    .map(comment => {
      if (comment.id === parentId) {
        return Object.assign({}, comment, {
          replies: comment.replies?.filter(reply => reply.id !== id)
        })
      }

      return comment
    })

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
        },
        replies: null
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