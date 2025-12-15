import Comment from './Comment'
import data from '../../data/comments.json'
import { createContext, useReducer } from 'react'
import { useState } from 'react'

export const StateContext = createContext({})

function CommentsList() {
    const [comments, setComments] = useState(data)

    return (
        <StateContext.Provider value={{setComments}}>
            <div className="comments-list">
                {comments.map(comment => (
                    <Comment
                        parentComment={comment}
                        key={comment.id}
                    />
                ))}
            </div>
        </StateContext.Provider>
    )
}

export default CommentsList