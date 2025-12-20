import Thread from './Thread'
import comments from '../../data/comments.json'
import FormComponent from './FormComponent'
import { useState } from 'react'

function CommentsList() {
    const [items, setItems] = useState(comments)
    const newId = Math.max.apply(null, items.map(item => item.id)) + 1

    const createComment = content =>
        setItems(prev =>
            [...prev, {
                id: newId,
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
            }]
        )

    return (
        <div className="comments-list">
            {items.map(parentComment => (
                <Thread
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