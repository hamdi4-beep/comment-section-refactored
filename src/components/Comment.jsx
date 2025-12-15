import { useState } from "react"

const CommentCard = ({
  comment,
  updateComment
}) => {
  const handleUpVoteClick = () => {
    const updatedComment = {
      ...comment,
      score: comment.score + 1
    }

    updateComment(prev => {
      if (prev.id === comment.id) return updatedComment

      return {
        ...prev,
        replies: prev.replies.map(reply =>
          reply.id === comment.id ? updatedComment : reply
        )
      }
    })
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

    updateComment(prev => ({
      ...prev,
      replies: prev.replies.concat(newReply)
    }))
  }

  return (
    <div className="comment">
      <div className="score-component">
        <button onClick={handleUpVoteClick}>+</button>
        <span>{comment.score}</span>
        <button>-</button>
      </div>

      <div className="content">
        <div className="card-header">
          <div className="user-img">
            <img src={comment.user.image.png} alt="user avatar" />
          </div>

          <p>{comment.user.username}</p>

          <div className="actions">
            <button onClick={handleReplyClick}>Reply</button>
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