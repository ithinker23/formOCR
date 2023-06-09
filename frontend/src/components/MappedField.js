import React, { useRef } from 'react'

export default function MappedField(props) {

    const validationRef = useRef()

    const handleDeleteField = () => {
        props.deleteField(props.fieldInfo.id)
    }

    const handleValidation = () => {
        console.log(props.templateName)
        props.addValidation(props.templateName, props.fieldInfo.Question, validationRef.current.value)
    }
    
    return (
        <div className='formField'>
            {props.deleteField? <button onClick={handleDeleteField}>delete</button> : null}
            <div className='formFieldQuestion'> {props.fieldInfo.Question} </div>
            <div className='showFieldStats'>
                <p>Page: {props.fieldInfo.Page}</p>
                <p>X: {props.fieldInfo.StartX}</p>
                <p>Y: {props.fieldInfo.StartY}</p>
                <p>Width: {props.fieldInfo.Width}</p>
                <p>Height: {props.fieldInfo.Height}</p>
            </div>
            <div className='formFieldAnswer'>{props.fieldInfo.Answer}</div>
            <div className='answerValidationWrapper'>
                <input ref= {validationRef}type="text"/>
                <button onClick={handleValidation}>Validate</button>
            </div>
        </div>
    )
}
