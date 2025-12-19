import Comment from "./Comment"

function Thread({
  parentComment,
  updateComments
}) {
  return (
    <div className="thread">
      <Comment
        comment={parentComment}
        parentComment={null}
        updateComments={updateComments}
      />

      <div className="replies-list">
        {parentComment.replies.map(reply => (
          <Comment
            comment={reply}
            parentComment={parentComment}
            updateComments={updateComments}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Thread