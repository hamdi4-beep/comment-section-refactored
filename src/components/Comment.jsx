import { useState } from "react"
import { createUpdatedComment } from "../utils/commentUtils"
import FormComponent from "./FormComponent"

const CommentCard = ({
  comment,
  updateComment
}) => {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleUpVoteClick = () => {
    updateComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        score: comment.score + 1
      })
    )
  }

  const handleDownVoteClick = () => {
    updateComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        score: comment.score - 1
      })
    )
  }

  const editComment = content => {
    updateComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        content
      })
    )

    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    updateComment(parentComment => {
      if (parentComment.id === comment.id) return null

      return Object.assign({}, parentComment, {
          replies: parentComment.replies.filter(reply => reply.id !== comment.id)
        })
    })
  }

  const createReply = content => {
    const newReply = {
      id: "67d51541-8a74-4624-895a-638892c10d13",
      content,
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

    setIsReplying(false)
  }

  return (
    <div className="wrapper">
      <div className="comment">
        <div className="score-component">
          <button onClick={handleUpVoteClick}>
            <img src="/images/icon-plus.svg" alt="" />
          </button>

          <span>{comment.score}</span>

          <button onClick={handleDownVoteClick}>
            <img src="/images/icon-minus.svg" alt="" />
          </button>
        </div>

        <div className="content">
          <div className="card-header">
            <div className="user">
              <div className="user-img">
                <img src={comment.user.image.png} alt="user avatar" />
              </div>

              <p className="username">{comment.user.username}</p>
              <span className="comment-date">{comment.createdAt}</span>
            </div>

            <div className="actions">
              <button onClick={() => setIsReplying(prev => !prev)}>
                <img src="/images/icon-reply.svg" alt="" />
                <span>Reply</span>
              </button>

              <button onClick={() => setIsEditing(prev => !prev)}>
                <img src="/images/icon-edit.svg" alt="" />
                <span>Edit</span>
              </button>

              <button onClick={handleDeleteClick}>
                <img src="/images/icon-delete.svg" alt="" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <p>{comment.content}</p>
        </div>
      </div>

      {isReplying && (
        <FormComponent triggerUpdate={createReply} />
      )}

      {isEditing && (
        <FormComponent
          value={comment.content}
          triggerUpdate={editComment}
        />
      )}
    </div>
  )
}

function Comment({ parentComment }) {
  const [parentItem, setParentItem] = useState(parentComment)

  if (!parentItem) return
  
  return (
    <div className="thread">
      <CommentCard
        comment={parentItem}
        updateComment={setParentItem}
      />

      <div className="replies-list">
        {parentItem.replies.map(reply => (
          <CommentCard
            comment={reply}
            updateComment={setParentItem}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Comment