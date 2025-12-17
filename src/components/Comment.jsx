import { useState } from "react"
import { createUpdatedComment } from "../utils/commentUtils"
import FormComponent from "./FormComponent"

const CommentCard = ({
  comment,
  updateParentComment
}) => {
  const [formStatus, setFormStatus] = useState(null)
  const [voteStatus, setVoteStatus] = useState(null)
  const [isModalHidden, setIsModalHidden] = useState(true)
  // mimicks user authentication - just for demo purposes
  const isCurrentUser = comment.user.username === 'juliusomo'

  const handleUpVoteClick = () => {
    setVoteStatus('upvoted')

    updateParentComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        score: voteStatus === 'upvoted' ? comment.score : comment.score + 1
      })
    )
  }

  const handleDownVoteClick = () => {
    setVoteStatus('downvoted')

    updateParentComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        score: voteStatus === 'downvoted' ? comment.score : comment.score - 1
      })
    )
  }

  const handleDeleteComment = () => {
    updateParentComment(parentComment => {
      if (parentComment.id === comment.id) return null

      return Object.assign({}, parentComment, {
          replies: parentComment.replies.filter(reply => reply.id !== comment.id)
        })
    })
  }

  const editComment = content => {
    updateParentComment(parentComment =>
      createUpdatedComment(parentComment, comment, {
        content
      })
    )

    setFormStatus(null)
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

    updateParentComment(parentComment =>
      Object.assign({}, parentComment, {
        replies: parentComment.replies.concat(newReply)
      })
    )

    setFormStatus(null)
  }

  return (
    <div className="wrapper">
      <div className="comment">
        <div className="score-component">
          <button onClick={handleUpVoteClick}>
            <img src="/images/icon-plus.svg" alt="" />
          </button>

          <span className="comment-score">{comment.score}</span>

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
              {!isCurrentUser && (
                <button onClick={() => setFormStatus(prev => prev === 'replying' ? null : 'replying')}>
                  <img src="/images/icon-reply.svg" alt="" />
                  <span className="reply-label">Reply</span>
                </button>
              )}

              {isCurrentUser && (
                <button onClick={() => setFormStatus(prev => prev === 'editing' ? null : 'editing')}>
                  <img src="/images/icon-edit.svg" alt="" />
                  <span className="edit-label">Edit</span>
                </button>
              )}

              {isCurrentUser && (
                <button onClick={() => setIsModalHidden(false)}>
                  <img src="/images/icon-delete.svg" alt="" />
                  <span className="delete-label">Delete</span>
                </button>
              )}
            </div>
          </div>

          <p>
            {comment.replyingTo && (
              <span className="replying-to">@{comment.replyingTo} </span>
            )}

            {comment.content}
          </p>
        </div>
      </div>

      {formStatus === 'replying' && (
        <FormComponent triggerUpdate={createReply} />
      )}

      {formStatus === 'editing' && (
        <FormComponent
          value={comment.content}
          triggerUpdate={editComment}
        />
      )}

      {!isModalHidden && (
        <div className="delete-modal">
          <p>Delete comment</p>
          <span>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</span>
          
          <div className="action-buttons">
            <button className="cancel-action" onClick={() => setIsModalHidden(true)}>No, Cancel</button>
            <button className="delete-action" onClick={handleDeleteComment}>Yes, Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

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