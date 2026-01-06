function FormComponent({
    value = '',
    onSubmit
}) {
    const handleSubmit = e => {
        const formElem = e.currentTarget
        e.preventDefault()
        
        const formData = new FormData(formElem)
        const comment = formData.get('comment')
        
        if (comment) {
            onSubmit(comment)
        }

        formElem.reset()
    }

    return (
        <div className="form-component">
            <div className="user-img">
                <img src={import.meta.env.BASE_URL + '/images/avatars/image-juliusomo.png'} alt="" />
            </div>

            <form action="#" onSubmit={handleSubmit}>
                <textarea name="comment" id="comment" placeholder="Add a comment..." defaultValue={value} autoFocus></textarea>
                <button className="cta">send</button>
            </form>
        </div>
    )
}

export default FormComponent