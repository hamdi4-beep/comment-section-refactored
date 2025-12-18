import { useRef } from "react"
import { useEffect } from "react"

function FormComponent({
    value = '',
    triggerUpdate
}) {
    const textAreaRef = useRef(null)

    useEffect(() => {
        const {current} = textAreaRef
        if (current) current.focus()
    }, [])

    const handleSubmit = e => {
        e.preventDefault()
        
        const formData = new FormData(e.currentTarget)
        const comment = formData.get('comment')
        
        if (comment) {
            triggerUpdate(comment)
        }
    }

    return (
        <div className="form-component">
            <div className="user-img">
                <img src="/images/avatars/image-juliusomo.png" alt="" />
            </div>

            <form action="#" onSubmit={handleSubmit}>
                <textarea name="comment" id="comment" placeholder="Add a comment..." defaultValue={value} ref={textAreaRef}></textarea>
                <button className="cta">send</button>
            </form>
        </div>
    )
}

export default FormComponent