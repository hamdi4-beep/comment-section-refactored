export const update = (parentComment, targetComment, props) => {
  const updatedComment = Object.assign({}, targetComment, props)

  if (parentComment.id === targetComment.id) return updatedComment

  return Object.assign({}, parentComment, {
    replies: parentComment.replies.map(reply =>
      reply.id === targetComment.id ? updatedComment : reply
    )
  })
}