import Comment from './Comment'
import comments from '../../data/comments.json'
import FormComponent from './FormComponent'

function CommentsList() {
    return (
        <div className="comments-list">
            {comments.map(parentComment => (
                <Comment
                    comment={parentComment}
                    key={parentComment.id}
                />
            ))}

            <FormComponent />
        </div>
    )
}

export default CommentsList