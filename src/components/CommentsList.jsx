import Comment from './Comment'
import comments from '../../data/comments.json'
import FormComponent from './FormComponent'

function CommentsList() {
    return (
        <div className="comments-list">
            {comments.map(comment => (
                <Comment
                    parentComment={comment}
                    key={comment.id}
                />
            ))}

            <FormComponent />
        </div>
    )
}

export default CommentsList