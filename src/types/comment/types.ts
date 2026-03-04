export interface Comment {
  parentId: null | string
  id: string
  content: string
  createdAt: string
  score: number
  replyingTo: null | string
  user: {
    image: {
      png: string
      webp: string
    }
    username: string
  }
  replies: Comment[]
}

export interface Actions {
  createComment: (content: Comment['content']) => void
  createReply: (parentId: Comment['id'], replyingTo: Comment['replyingTo'], content: Comment['content']) => void
  deleteComment: (id: Comment['id']) => void
  editComment: (id: Comment['id'], content: Comment['content']) => void
  updateScore: (id: Comment['id'], delta: number) => void
}