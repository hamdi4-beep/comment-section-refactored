import Comment from './Comment'
import comments from '../../data/comments.json'
import FormComponent from './FormComponent'
import { useState } from 'react'

function CommentsList() {
    const [items, setItems] = useState(comments)

    return (
        <div className="comments-list">
            {items.map(parentComment => (
                <Comment
                    parentComment={parentComment}
                    updateComments={setItems}
                    key={parentComment.id}
                />
            ))}

            <FormComponent triggerUpdate={() => console.log('add a new comment')} />
        </div>
    )
}

export default CommentsList