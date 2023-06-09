import React, { useRef } from 'react'
import AddQuestionForm from './AddQuestionForm'
import MappedField from './MappedField'


export default function FieldsColumn(props) {

  const templateNameRef = useRef(null)

  const handleTemplateSave = ()=>{
    props.saveTemplate(templateNameRef.current.value);
    props.setFormFields(prev => {
      return prev.map(field => {
        return {...field, templateName:templateNameRef.current.value}
      })
    })
    // templateNameRef.current.value = ""
  }

  return (
    <div className='fieldsColumn'>
        {props.isAddingQuestion ? <AddQuestionForm setFormFields={props.setFormFields} pendingField={props.pendingField} clearRect={props.clearRect}/> : null}
        <input ref={templateNameRef}/>
        <button onClick={handleTemplateSave}>saveTemplate</button>
        {props.formFields.map((fieldInfo)=>{
            return <MappedField deleteField={props.deleteField} fieldInfo={fieldInfo} />
        })}
    </div>
  )
}
