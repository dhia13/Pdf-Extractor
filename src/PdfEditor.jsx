import { useState } from "react";
import Step0 from "./Components/Step0";
import Step1 from "./Components/Step1";
import Step2 from "./Components/Step2";
import Step3 from "./Components/Step3";
import Step4 from "./Components/Step4";
import Paint from "./Components/Paint"; // active step 5
import Mo from "./Components/PaintComponents/Mo";
const PdfEditor = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [editedpdfDoc, setEditedPdfDoc] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [sketchInfo, setSketchInfo] = useState({
    pdfFile: pdfDoc,
    edited: false,
    selectedPage: 0,
    totalPages: 0,
    selectedPage: 0,
    plans: [],
  });
  const handleSelectPageForDrawing = (page) => {
    let newSketchInfo = sketchInfo;
    newSketchInfo.selectedPage = page + 1;
    setSketchInfo(newSketchInfo);
    setActiveStep(5);
  };
  return (
    <div className="w-screen h-screen overflow-hidden">
      {/*  upload pdf from computer button*/}
      {activeStep == 0 && <Step0 setActiveStep={setActiveStep} />}
      {/* select pdfs and then press continue */}
      {activeStep == 1 && (
        <Step1
          fileNames={fileNames}
          setFileNames={setFileNames}
          pdfDocs={pdfDocs}
          setPdfDocs={setPdfDocs}
          setActiveStep={setActiveStep}
        />
      )}
      {/* pdfdocs list +  pages list to select for fusion*/}
      {activeStep == 2 && (
        <Step2
          pdfDocs={pdfDocs}
          setPdfDoc={setPdfDoc}
          setActiveStep={setActiveStep}
          fileNames={fileNames}
        />
      )}
      {/* download or draw */}
      {activeStep == 3 && (
        <Step3
          setSketchInfo={setSketchInfo}
          setActiveStep={setActiveStep}
          pdfDoc={pdfDoc}
          setPdfDocs={setPdfDocs}
          setFileNames={setFileNames}
        />
      )}
      {/* select page to draw on */}
      {activeStep == 4 && (
        <Step4
          handleSelectPageForDrawing={handleSelectPageForDrawing}
          sketchInfo={sketchInfo}
          pdfDoc={pdfDoc}
          editedpdfDoc={editedpdfDoc}
        />
      )}
      {/* draw canvas */}
      {activeStep == 5 && (
        <Paint
          setSketchInfo={setSketchInfo}
          sketchInfo={sketchInfo}
          pdfDoc={pdfDoc}
          pageNumber={sketchInfo.selectedPage}
          setActiveStep={setActiveStep}
          editedpdfDoc={editedpdfDoc}
        />
      )}
      {activeStep == 13 && (
        <Mo
          setSketchInfo={setSketchInfo}
          sketchInfo={sketchInfo}
          pdfDoc={pdfDoc}
        />
      )}
    </div>
  );
};

export default PdfEditor;
