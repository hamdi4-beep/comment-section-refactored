import { useState } from "react"
import { update } from "../utils/commentUtils"

const CommentCard = ({
  comment,
  parentComment,
  updateComment
}) => {
  const handleUpVoteClick = () => {
    const updatedComment = update(parentComment, comment, {
        score: comment.score + 1
      })

    updateComment(updatedComment)
  }

  const handleDownVoteClick = () => {
    const updatedComment = update(parentComment, comment, {
        score: comment.score - 1
      })

    updateComment(updatedComment)
  }

  const handleReplyClick = () => {
    const newReply = {
      id: "67d51541-8a74-4624-895a-638892c10d13",
      content: "new reply",
      createdAt: "just now",
      score: 0,
      replyingTo: comment.user.username,
      user: {
        image: { 
          png: "./images/avatars/image-juliusomo.png",
          webp: "./images/avatars/image-juliusomo.webp"
        },
        username: "juliusomo"
      }
    }

    updateComment(parentComment =>
      Object.assign({}, parentComment, {
        replies: parentComment.replies.concat(newReply)
      })
    )
  }

  const handleEditClick = () => {
    const updatedComment = update(parentComment, comment, {
        content: 'edited!'
      })

    updateComment(updatedComment)
  }

  const handleDeleteClick = () => {
    updateComment(parentComment =>
      Object.assign({}, parentComment, {
        replies: parentComment.replies.filter(reply => reply.id !== comment.id)
      })
    )
  }

  return (
    <div className="comment">
      <div className="score-component">
        <button onClick={handleUpVoteClick}>+</button>
        <span>{comment.score}</span>
        <button onClick={handleDownVoteClick}>-</button>
      </div>

      <div className="content">
        <div className="card-header">
          <div className="user">
            <div className="user-img">
              <img src={comment.user.image.png} alt="user avatar" />
            </div>

            <p>{comment.user.username}</p>
          </div>

          <div className="actions">
            <button onClick={handleReplyClick}>Reply</button>
            <button onClick={handleEditClick}>Edit</button>
            <button onClick={handleDeleteClick}>Delete</button>
          </div>
        </div>

        <p>{comment.content}</p>
      </div>
    </div>
  )
}

function Comment({ parentComment }) {
  const [parentItem, setParentItem] = useState(parentComment)
  
  return (
    <div className="thread">
      <CommentCard
        comment={parentItem}
        parentComment={null}
        updateComment={setParentItem}
      />

      <div className="replies-list">
        {parentItem.replies.map(reply => (
          <CommentCard
            comment={reply}
            parentComment={parentItem}
            updateComment={setParentItem}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Comment