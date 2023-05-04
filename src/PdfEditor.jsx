import { useState } from "react";
import StartingPage from "./Components/StartingPage";
import UploadPdfs from "./Components/UploadPdfs";
import SelectPages from "./Components/SelectPages";
import DownloadOrEdit from "./Components/DownloadOrEdit";
import EditPages from "./Components/EditPages";
import Paint from "./Components/Paint"; // active step 5
import Test from "./Components/PaintComponents/Test";
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
    newSketchInfo.selectedPage = page;
    setSketchInfo(newSketchInfo);
    setActiveStep(5);
  };
  return (
    <div className="w-screen h-screen overflow-hidden">
      {/*  upload pdf from computer button*/}
      {activeStep == 0 && <StartingPage setActiveStep={setActiveStep} />}
      {/* select pdfs and then press continue */}
      {activeStep == 1 && (
        <UploadPdfs
          fileNames={fileNames}
          setFileNames={setFileNames}
          pdfDocs={pdfDocs}
          setPdfDocs={setPdfDocs}
          setActiveStep={setActiveStep}
        />
      )}
      {/* pdfdocs list +  pages list to select for fusion*/}
      {activeStep == 2 && (
        <SelectPages
          pdfDocs={pdfDocs}
          setPdfDoc={setPdfDoc}
          setActiveStep={setActiveStep}
          fileNames={fileNames}
        />
      )}
      {/* download or draw */}
      {activeStep == 3 && (
        <DownloadOrEdit
          setSketchInfo={setSketchInfo}
          setActiveStep={setActiveStep}
          pdfDoc={pdfDoc}
          setPdfDocs={setPdfDocs}
          setFileNames={setFileNames}
        />
      )}
      {/* reorder pages or select a page to draw on */}
      {activeStep == 4 && (
        <EditPages
          handleSelectPageForDrawing={handleSelectPageForDrawing}
          sketchInfo={sketchInfo}
          pdfDoc={pdfDoc}
          editedpdfDoc={editedpdfDoc}
          setSketchInfo={setSketchInfo}
        />
      )}
      {/* draw canvas paint */}
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
      {/* for testing */}
      {activeStep == 6 && (
        <Test
          setSketchInfo={setSketchInfo}
          sketchInfo={sketchInfo}
          pdfDoc={pdfDoc}
        />
      )}
    </div>
  );
};

export default PdfEditor;
