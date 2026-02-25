import { useState } from "react"
import FormComponent from "./FormComponent"
import type { Comment, Actions } from "../types/comment/types"

const ScoreComponent = ({
  score,
  incrementScore,
  decrementScore
}: {
  score: Comment['score']
  incrementScore: () => void
  decrementScore: () => void
}) => {
  const [voteStatus, setVoteStatus] = useState<null | 'up' | 'down'>(null)

  const handleUpVoteClick = () => {
    setVoteStatus(prev => prev === 'down' ? null : 'up')
    incrementScore()
  }

  const handleDownVoteClick = () => {
    setVoteStatus(prev => prev === 'up' ? null : 'down')
    decrementScore()
  }

  return (
    <div className="score-component">
      <button onClick={handleUpVoteClick} disabled={voteStatus === 'up'}>
        <img src={import.meta.env.BASE_URL + '/images/icon-plus.svg'} alt="plus icon for upvoting" />
      </button>

      <span className="comment-score">{score}</span>

      <button onClick={handleDownVoteClick} disabled={voteStatus === 'down'}>
        <img src={import.meta.env.BASE_URL + '/images/icon-minus.svg'} alt="minus icon for downvoting" />
      </button>
    </div>
  )
}

function Comment({
  comment,
  actions
}: {
  comment: Comment
  actions: Actions
}) {
  const [formStatus, setFormStatus] = useState<string | null>(null)
  const [isModalHidden, setIsModalHidden] = useState(true)
  // mimicks user authentication - just for demo purposes
  const isCurrentUser = comment.user.username === 'juliusomo'

  const handleReplySubmit = (content: Comment['content']) => {
    actions.createReply(comment.parentId, comment.id, comment.user.username, content)
    setFormStatus(null)
  }

  const handleEditSubmit = (content: Comment['content']) => {
    actions.editComment(comment.parentId, comment.id, content)
    setFormStatus(null)
  }

  return (
    <div className="container">
      <div className="wrapper">
        <div className="comment">
          <ScoreComponent
            score={comment.score}
            incrementScore={() => actions.updateScore(comment.parentId, comment.id, +1)}
            decrementScore={() => actions.updateScore(comment.parentId, comment.id, -1)}
          />

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
              <button className="delete-action" onClick={() => actions.deleteComment(comment.parentId, comment.id)}>Yes, Delete</button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && (
        <div className="reply-list">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comment