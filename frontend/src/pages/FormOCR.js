import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react';
import SinglePage from '../components/pdf/single-page';
import filledPDF from '../pdfs/Sample.pdf';
import MappedField from '../components/MappedField';

export default function FormOCR(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt pages
  const templateRef = useRef(null)
  const overlayRef = useRef(null)
  const canvasRef = useRef(null)
  const contextRef = useRef(null);
  const canvasOffSetX = useRef(null);
  const canvasOffSetY = useRef(null);
  const [templateName, setTemplateName] = useState("")
  const [formFields, setFormFields] = useState([])

  const handlePageRender = () => {
    const canvas = overlayRef.current

    canvas.height = canvasRef.current.clientHeight
    canvas.width = canvasRef.current.clientWidth

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "red";
    context.lineWidth = 2;
    contextRef.current = context;

    const canvasOffSet = canvas.getBoundingClientRect();
    canvasOffSetX.current = canvasOffSet.top;
    canvasOffSetY.current = canvasOffSet.left;

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    outlineFields()
  }

  const outlineFields = () =>{
    formFields.forEach((field)=>{
      if(field.Page == pageNumber){
        contextRef.current.strokeRect(field.StartX, field.StartY, field.Width, field.Height);
      }
    })
  }
  const loadOCR = async () => {
    let res = await props.OCRAPI.post('/OCR/OCRFromTemplate', { name: templateRef.current.value })
    setTemplateName(templateRef.current.value)
    setFormFields(res.data.fields)
  }

  const addValidation = async (name, question, validation)=>{
    props.OCRAPI.post('/OCR/addValidatedAnswer', {name:name, field_name:question, validation: validation })
  }

  useEffect(()=>{
    outlineFields()
  },[formFields])

  return (
    <div className="formOCR">
      <div className='formPreview'>
        <SinglePage pdf={filledPDF} ref={canvasRef} handlePageRender={handlePageRender} numPages={numPages} setNumPages={setNumPages} setPageNumber={setPageNumber} pageNumber={pageNumber} />
        <canvas className='formPreviewCanvas' ref={overlayRef}></canvas>
        <NavLink to='/'>TO ADMIN</NavLink>
      </div>
      <div className='ocrResults'>
        <input ref={templateRef} />
        <button onClick={loadOCR}>LOAD OCR FROM TEMPLATE</button>
        {formFields.map((fieldInfo) => {
          return <MappedField templateName={templateName} addValidation={addValidation} fieldInfo={fieldInfo} />
        })}
      </div>
    </div>
  )
}
