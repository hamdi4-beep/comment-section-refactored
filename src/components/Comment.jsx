import { useState } from "react"

const CommentCard = ({
  comment,
  updateParent
}) => {
  const [item, setItem] = useState(comment)

  const handleUpVoteClick = () =>
    setItem(prev => ({
      ...prev,
      score: prev.score + 1
    }))

  const handleReplyClick = () => 
    updateParent(prev => ({
      ...prev,
      replies: prev.replies.concat({
        ...prev,
        content: 'new reply'
      })
    }))

  return (
    <div className="comment">
      <div className="score-component">
        <button onClick={handleUpVoteClick}>+</button>
        <span>{item.score}</span>
        <button>-</button>
      </div>

      <div className="content">
        <div className="card-header">
          <div className="user-img">
            <img src={item.user.image.png} alt="user avatar" />
          </div>

          <p>{item.user.username}</p>

          <div className="actions">
            <button onClick={handleReplyClick}>Reply</button>
          </div>
        </div>

        <p>{item.content}</p>
      </div>
    </div>
  )
}

function Comment({ parentComment }) {
  const [parentItem, setParentItem] = useState(parentComment)
  console.log(parentItem)
  
  return (
    <div className="thread">
      <CommentCard
        comment={parentItem}
        updateParent={setParentItem}
      />

      <div className="replies-list">
        {parentItem.replies.map(reply => (
          <CommentCard
            comment={reply}
            updateParent={setParentItem}
            key={reply.id}
          />
        ))}
      </div>
    </div>
  )
}

export default Comment