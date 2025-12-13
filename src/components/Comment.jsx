const CommentCard = ({
  comment,
  parentComment
}) => {
  const targetComment = parentComment || comment

  return (
    <div className="comment">
      <p>{comment.content}</p>
      <button onClick={() => console.log(targetComment)}>Action</button>
    </div>
  )
}

function Comment({ parentComment }) {
  return (
    <div className="thread">
      <CommentCard
        comment={parentComment}
        parentComment={null}
      />

      <div className="replies-list">
        {parentComment.replies.map(reply => (
          <CommentCard
            comment={reply}
            parentComment={parentComment}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Comment