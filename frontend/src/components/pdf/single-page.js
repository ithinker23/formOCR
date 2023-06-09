import React, { useState, forwardRef} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const SinglePage = forwardRef((props, canvasRef) => {

    function onDocumentLoadSuccess({ numPages }) {
      props.setNumPages(numPages);
      props.setPageNumber(1);
    }
  
    function changePage(offset) {
      props.setPageNumber(prevPageNumber => prevPageNumber + offset);
    }
  
    function previousPage() {
      changePage(-1);
    }
  
    function nextPage() {
      changePage(1);
    }
  
    const { pdf } = props;
  
    return (
      <>
        <Document
          file={pdf}
          options={{ workerSrc: "/pdf.worker.js" }}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={props.pageNumber} renderTextLayer={false} canvasRef={canvasRef ? canvasRef: null} onRenderSuccess={props.handlePageRender ? props.handlePageRender : null}/>
        </Document>

        <div className="formPreviewNav">
          
          <button className="formPreviewbutton" type="button" disabled={props.pageNumber <= 1} onClick={previousPage}>
            Previous
          </button>
          <p className="formPagePreview">
            Page {props.pageNumber || (props.numPages ? 1 : "--")} of {props.numPages || "--"}
          </p>
          <button
          className="formPreviewbutton"
            type="button"
            disabled={props.pageNumber >= props.numPages}
            onClick={nextPage}
          >
            Next
          </button>
        </div>
      </>
    );
})
 
export default SinglePage