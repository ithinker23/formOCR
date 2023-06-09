import React, { useRef, useState } from 'react'
import SinglePage from "../components/pdf/single-page";
import samplePDF from '../pdfs/Sample.pdf';
import FieldsColumn from '../components/FieldsColumn'
import { NavLink } from 'react-router-dom';

export default function FormPreview(props) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt pages

    const canvasRef = useRef(null)
    const overlayRef = useRef(null)
    const contextRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const [isAddingQuestion, setIsAddingQuestion] = useState(false)

    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);

    const [formFields, setFormFields] = useState([])

    const [pendingField, setPendingField] = useState()

    const handlePageRender = () => {
        const canvas = overlayRef.current

        canvas.height = canvasRef.current.clientHeight
        canvas.width = canvasRef.current.clientWidth

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        contextRef.current = context;

        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }

    const startDrawingRectangle = ({ nativeEvent }) => {
        setIsAddingQuestion(false)

        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        startX.current = nativeEvent.pageX;
        startY.current = nativeEvent.pageY;

        setIsDrawing(true);
    };

    const drawRectangle = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }

        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        const newMouseX = nativeEvent.pageX;
        const newMouseY = nativeEvent.pageY;

        const rectWidth = newMouseX - startX.current;
        const rectHeight = newMouseY - startY.current;

        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        contextRef.current.strokeRect(startX.current, startY.current, rectWidth, rectHeight);
    };

    const stopDrawingRectangle = ({nativeEvent}) => {
        if (isDrawing) {
            setIsDrawing(false);
            setIsAddingQuestion(true);
            setPendingField({ Page_Width: canvasRef.current.clientWidth, Page_Height: canvasRef.current.clientHeight, Page: pageNumber, StartX: startX.current, StartY: startY.current, Width: nativeEvent.pageX - startX.current, Height: nativeEvent.pageY - startY.current})
        }
    };

    const clearRect = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setIsAddingQuestion(false)
    }

    const saveTemplate = async (name) => {
        let res = await props.OCRAPI.post('/templates/saveTemplate', {fields:formFields, name:name})
        console.log(res)
    }


    const deleteField = (id) =>{
        setFormFields((prev) =>{
            let newFields = []
            prev.forEach((field)=>{
                if(field.id != id){
                    newFields.push(field)
                }
            })
            return newFields
        })
    }

    return (
        <div className="formOCR">
            <div className='formPreview'>
                <SinglePage pdf={samplePDF} ref={canvasRef} handlePageRender={handlePageRender} numPages={numPages} setNumPages={setNumPages} setPageNumber={setPageNumber} pageNumber={pageNumber}/>
                <canvas className='formPreviewCanvas' ref={overlayRef}
                    onMouseDown={startDrawingRectangle}
                    onMouseMove={drawRectangle}
                    onMouseUp={stopDrawingRectangle}
                    onMouseLeave={stopDrawingRectangle}></canvas>
                <NavLink to='/Client'>TO CLIENT</NavLink>
            </div>
            <FieldsColumn deleteField={deleteField} saveTemplate={saveTemplate} setFormFields={setFormFields} pendingField={pendingField} formFields={formFields} isAddingQuestion={isAddingQuestion} clearRect={clearRect}/>
        </div>
    )
}
