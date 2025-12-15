import Comment from './Comment'
import comments from '../../data/comments.json'

function CommentsList() {
    return (
        <div className="comments-list">
            {comments.map(comment => (
                <Comment
                    parentComment={comment}
                    key={comment.id}
                />
            ))}
        </div>
    )
}

export default CommentsList