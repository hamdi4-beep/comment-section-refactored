import { useState } from "react"
import CommentCard from "./CommentCard"

function Comment({ comment }) {
  const [parentComment, setParentComment] = useState(comment)

  if (!parentComment) return
  
  return (
    <div className="thread">
      <CommentCard
        comment={parentComment}
        updateParentComment={setParentComment}
      />

      <div className="replies-list">
        {parentComment.replies.map(reply => (
          <CommentCard
            comment={reply}
            updateParentComment={setParentComment}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Comment