import CommentCard from "./CommentCard"

function Comment({
  parentComment,
  updateComments
}) {
  return (
    <div className="thread">
      <CommentCard
        comment={parentComment}
        parentComment={null}
        updateComments={updateComments}
      />

      <div className="replies-list">
        {parentComment.replies.map(reply => (
          <CommentCard
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

export default Comment