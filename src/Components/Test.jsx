import React, { useState } from 'react';
// import { Document, Page } from 'react-pdf';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export default function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      {file && (
        <Document file={file} >
          <Page pageNumber={1} />
        </Document>
      )}
    </div>
  );
}
