import { useState, useRef, memo } from "react"
import FormComponent from "./FormComponent"

const createUpdatedComment = (tree, target, props) =>
  tree.map(item => {
    if (item.id === target.id)
      return Object.assign({}, item, props)

    if (item.replies && item.replies.some(reply => reply.id === target.id))
      return Object.assign({}, item, {
        replies: createUpdatedComment(item.replies, target, props)
      })

    return item
  })

const createReply = (state, parentComment, comment, content) => {
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

  createUpdatedComment(state, targetComment, {
    replies: targetComment.replies.concat(newReply)
  })
}

const incrementScore = (state, comment, currentScore) =>
  createUpdatedComment(state, comment, {
    score: currentScore >= comment.score ? comment.score + 1 : comment.score
  })

const decrementScore = (state, comment, currentScore) =>
  createUpdatedComment(state, comment, {
    score: currentScore <= comment.score ? comment.score - 1 : comment.score
  })

const updateContent = (state, comment, content) =>
  createUpdatedComment(state, comment, {
    content
  })

const deleteComment = (state, parentComment, comment) => {
  if (!parentComment)
    return state.filter(item => item.id !== comment.id)
  
  return state.map(item => {
    if (item.id === parentComment.id)
      return Object.assign({}, item, {
        replies: item.replies.filter(reply => reply.id !== comment.id)
      })

    return item
  })
}

const Comment = memo(function({
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

  const handleUpVoteClick = () =>
    updateComments(prev => incrementScore(prev, comment, currentScoreRef.current))

  const handleDownVoteClick = () =>
    updateComments(prev => decrementScore(prev, comment, currentScoreRef.current))

  const handleDeleteClick = () =>
    updateComments(prev => deleteComment(prev, parentComment, comment))

  const handleEditSubmit = content => {
    createUpdatedComment(prev => updateContent(prev, comment, content))
    setFormStatus(null)
  }

  const handleReplySubmit = content => {
    updateComments(prev => createReply(prev, parentComment, comment, content))
    setFormStatus(null)
  }

  return (
    <div className="container">
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
          <FormComponent onSubmit={handleReplySubmit} />
        )}

        {formStatus === 'editing' && (
          <FormComponent
            value={comment.content}
            onSubmit={handleEditSubmit}
          />
        )}

        {!isModalHidden && (
          <div className="delete-modal">
            <p>Delete comment</p>
            <span>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</span>
            
            <div className="action-buttons">
              <button className="cancel-action" onClick={() => setIsModalHidden(true)}>No, Cancel</button>
              <button className="delete-action" onClick={handleDeleteClick}>Yes, Delete</button>
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
            updateComments={updateComments}
          />
        ))}
      </div>
    </div>
  )
})

export default Comment