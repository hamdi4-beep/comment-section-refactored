import Thread from './Thread'
import data from '../../data/comments.json'
import FormComponent from './FormComponent'
import { useState } from 'react'

function CommentSection() {
    const [comments, setComments] = useState(data)

    const createComment = content =>
        setComments(prev =>
            [...prev, {
                id: crypto.randomUUID(),
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
        <div className="comment-section">
            <div className="comments-list">
                {comments.map(parentComment => (
                    <Thread
                        parentComment={parentComment}
                        updateComments={setComments}
                        key={parentComment.id}
                    />
                ))}
            </div>

            <FormComponent triggerUpdate={createComment} />
        </div>
    )
}

export default CommentSection