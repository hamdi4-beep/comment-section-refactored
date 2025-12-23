import data from '../../data/comments.json'
import Comment from './Comment'
import FormComponent from './FormComponent'
import { useState } from 'react'

function CommentSection() {
    const [comments, setComments] = useState(data)
    const sortedComments = [...comments].sort((a, b) => b.score - a.score)

    const createComment = content =>
        setComments(prev =>
            [...prev, {
                id: crypto.randomUUID(),
                content,
                createdAt: "just now",
                score: 0,
                user: {
                    image: { 
                        png: "/images/avatars/image-juliusomo.png",
                        webp: "/images/avatars/image-juliusomo.webp"
                    },
                    username: "juliusomo"
                },
                replies: []
            }]
        )

    return (
        <div className="comment-section">
            <div className="comments-list">
                {sortedComments.map(parentComment => (
                    <div key={parentComment.id}>
                        <Comment
                            comment={parentComment}
                            parentComment={null}
                            updateComments={setComments}
                        />

                        <div className="replies-list">
                            {parentComment.replies.map(reply => (
                                <Comment
                                    comment={reply}
                                    parentComment={parentComment}
                                    updateComments={setComments}
                                    key={reply.id}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <FormComponent triggerUpdate={createComment} />
        </div>
    )
}

export default CommentSection