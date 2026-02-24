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
  replies: null | Comment[]
}

export interface Actions {
  createComment: (content: Comment['content']) => void
  createReply: (parentId: Comment['parentId'], id: Comment['id'], replyingTo: Comment['replyingTo'], content: Comment['content']) => void
  deleteComment: (parentId: Comment['parentId'], id: Comment['id']) => void
  editComment: (parentId: Comment['parentId'], id: Comment['id'], content: Comment['content']) => void
  updateScore: (parentId: Comment['parentId'], id: Comment['id'], currentScore: Comment['score'], delta: number) => void
}