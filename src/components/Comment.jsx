import { useState, useRef, memo } from "react"
import FormComponent from "./FormComponent"

const Comment = memo(function({
  comment,
  parentComment,
  incrementScore,
  decrementScore,
  updateContent,
  createReply,
  deleteComment
}) {
  const [formStatus, setFormStatus] = useState(null)
  const [isModalHidden, setIsModalHidden] = useState(true)
  // keeps track of the current score so the upvote and downvote update score relative to the current score.
  const currentScoreRef = useRef(comment.score)
  // mimicks user authentication - just for demo purposes
  const isCurrentUser = comment.user.username === 'juliusomo'

  return (
    <div className="container">
      <div className="wrapper">
        <div className="comment">
          <div className="score-component">
            <button onClick={() => incrementScore(comment, currentScoreRef.current)}>
              <img src={import.meta.env.BASE_URL + '/images/icon-plus.svg'} alt="plus icon for upvoting" />
            </button>

            <span className="comment-score">{comment.score}</span>

            <button onClick={() => decrementScore(comment, currentScoreRef.current)}>
              <img src={import.meta.env.BASE_URL + '/images/icon-minus.svg'} alt="minus icon for downvoting" />
            </button>
          </div>

          <div className="content">
            <div className="card-header">
              <div className="user">
                <div className="user-img">
                  <img src={import.meta.env.BASE_URL + comment.user.image.png} alt="user avatar" />
                </div>

                <p className="username">{comment.user.username}</p>
              </div>

              <span className="comment-date">{comment.createdAt}</span>

              <div className="actions">
                {!isCurrentUser && (
                  <button onClick={() => setFormStatus(prev => prev === 'replying' ? null : 'replying')}>
                    <img src={import.meta.env.BASE_URL + '/images/icon-reply.svg'} alt="reply icon" />
                    <span className="reply-label">Reply</span>
                  </button>
                )}

                {isCurrentUser && (
                  <button onClick={() => setFormStatus(prev => prev === 'editing' ? null : 'editing')}>
                    <img src={import.meta.env.BASE_URL + '/images/icon-edit.svg'} alt="edit icon" />
                    <span className="edit-label">Edit</span>
                  </button>
                )}

                {isCurrentUser && (
                  <button onClick={() => setIsModalHidden(false)}>
                    <img src={import.meta.env.BASE_URL + '/images/icon-delete.svg'} alt="delete icon" />
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
          <FormComponent onSubmit={content => createReply(comment, parentComment, content)} />
        )}

        {formStatus === 'editing' && (
          <FormComponent
            value={comment.content}
            onSubmit={content => updateContent(comment, content)}
          />
        )}

        {!isModalHidden && (
          <div className="delete-modal">
            <p>Delete comment</p>
            <span>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</span>
            
            <div className="action-buttons">
              <button className="cancel-action" onClick={() => setIsModalHidden(true)}>No, Cancel</button>
              <button className="delete-action" onClick={deleteComment}>Yes, Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className="reply-list">
        {comment.replies && comment.replies.map(reply => (
          <Comment
            key={reply.id}
            comment={reply}
            parentComment={comment}
            incrementScore={incrementScore}
            decrementScore={decrementScore}
            createReply={createReply}
            updateContent={updateContent}
            deleteComment={deleteComment}
          />
        ))}
      </div>
    </div>
  )
})

export default Comment