import Comment from './Comment'
import comments from '../../data/comments.json'
import FormComponent from './FormComponent'
import { useState } from 'react'

function CommentsList() {
    const [items, setItems] = useState(comments)
    const allCommentIds = items.map(item => item.id)

    const createComment = content => {
        const newComment = {
            id: Math.max.apply(null, allCommentIds) + 1,
            content,
            createdAt: "just now",
            score: 0,
            user: {
                image: { 
                png: "./images/avatars/image-juliusomo.png",
                webp: "./images/avatars/image-juliusomo.webp"
                },
                username: "juliusomo"
            },
            replies: []
        }

        setItems(prev => [...prev, newComment])
    }

    return (
        <div className="comments-list">
            {items.map(parentComment => (
                <Comment
                    parentComment={parentComment}
                    updateComments={setItems}
                    key={parentComment.id}
                />
            ))}

            <FormComponent triggerUpdate={createComment} />
        </div>
    )
}

export default CommentsList