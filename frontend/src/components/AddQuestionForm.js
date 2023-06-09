import React, { useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';

export default function AddQuestionForm(props) {

    const inputRef = useRef()

    const mapQuestion = () => {
        props.setFormFields((prev) => {
            return [{ ...props.pendingField, Question: inputRef.current.value, id: uuidv4()}, ...prev]
        })
    }

    return (
        <div className='formField pendingFieldForm'>
            <div className='pendingFieldTitle'>Map Question To Field</div>
            <input ref={inputRef} />
            <div className='pendingFieldFormButtons'>
                <button onClick={mapQuestion}>Map</button>
                <button onClick={props.clearRect}>Cancel</button>
            </div>

        </div>
    )
}
