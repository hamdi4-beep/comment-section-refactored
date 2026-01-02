import { useState, useRef } from "react"
import { createUpdatedComment } from "../utils/commentUtils"
import FormComponent from "./FormComponent"

function Comment({
  comment,
  parentComment,
  updateComments
}) {
  const [formStatus, setFormStatus] = useState(null)
  const [isModalHidden, setIsModalHidden] = useState(true)
  // keeps track of the current score so the upvote and downvote update score relative to the current score.
  const currentScoreRef = useRef(comment.score)
  // mimicks user authentication - just for demo purposes
  const isCurrentUser = comment.user.username === 'juliusomo'

  const handleUpVoteClick = () => {
    const createUpdatedScoreComment = item =>
      createUpdatedComment(item, comment, {
          score: currentScoreRef.current >= comment.score ? comment.score + 1 : comment.score
        })

    updateComments(prev =>
      prev.map(item => createUpdatedScoreComment(item))
    )
  }

  const handleDownVoteClick = () => {
    const createUpdatedScoreComment = item =>
      createUpdatedComment(item, comment, {
          score: currentScoreRef.current <= comment.score ? comment.score - 1 : comment.score
        })

    updateComments(prev =>
      prev.map(item => createUpdatedScoreComment(item))
    )
  }

  const handleDeleteComment = () => {
    updateComments(prev => {
      if (!parentComment)
        return prev.filter(item => item.id !== comment.id)
      
      return prev.map(item => {
        if (item.id === parentComment.id)
          return Object.assign({}, parentComment, {
            replies: parentComment.replies.filter(reply => reply.id !== comment.id)
          })

        return item
      })
    })
  }

  const editComment = content => {
    const createUpdatedContentComment = item =>
      createUpdatedComment(item, comment, {
        content
      })

    updateComments(prev =>
      prev.map(item => createUpdatedContentComment(item))
    )

    setFormStatus(null)
  }

  const createReply = content => {
    const targetComment = parentComment ?? comment

    const newReply = {
      id: crypto.randomUUID(),
      content,
      createdAt: "just now",
      score: 0,
      replyingTo: comment.user.username,
      user: {
        image: { 
          png: "/images/avatars/image-juliusomo.png",
          webp: "/images/avatars/image-juliusomo.webp"
        },
        username: "juliusomo"
      }
    }

    updateComments(prev =>
      prev.map(item => {
        if (item.id === targetComment.id)
          return Object.assign({}, targetComment, {
            replies: targetComment.replies.concat(newReply)
          })

        return item
      })
    )

    setFormStatus(null)
  }

  return (
    <div className="wrapper">
      <div className="comment">
        <div className="score-component">
          <button onClick={handleUpVoteClick}>
            <img src={import.meta.env.BASE_URL + '/images/icon-plus.svg'} alt="plus icon for upvoting" />
          </button>

          <span className="comment-score">{comment.score}</span>

          <button onClick={handleDownVoteClick}>
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
        <FormComponent onSubmit={createReply} />
      )}

      {formStatus === 'editing' && (
        <FormComponent
          value={comment.content}
          onSubmit={editComment}
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

export default Comment