import { useState } from "react";
import Step0 from "./Components/Step0";
import Step1 from "./Components/Step1";
import Step2 from "./Components/Step2";
import Step3 from "./Components/Step3";
import Step4 from "./Components/Step4";
import Test from "./Components/Test"; //active step 10
import SplitPain from "./Components/PaintComponents/SplitPaint"; // active step 11
import Paint from "./Components/Paint"; // active step 5
const PdfEditor = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [sketchInfo, setSketchInfo] = useState({
    pdfFile: pdfDoc,
    edited: false,
    selectedPage: 0,
    totalPages: 0,
    selectedPage: 0,
    sketches: [],
  });
  const handleSelectPageForDrawing = (page) => {
    let newSketchInfo = sketchInfo;
    newSketchInfo.selectedPage = page;
    setSketchInfo(newSketchInfo);
    setActiveStep(5);
  };
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200 rounded-md">
      <div className="  w-full h-full flex justify-center items-center">
        <div className="w-full h-full flex justify-start items-center flex-col">
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
            />
          )}
          {/* draw canvas */}
          {activeStep == 5 && (
            <Paint
              setSketchInfo={setSketchInfo}
              sketchInfo={sketchInfo}
              pdfDoc={pdfDoc}
              pageNumber={sketchInfo.selectedPage}
            />
          )}
          {activeStep == 11 && (
            <SplitPain
              setSketchInfo={setSketchInfo}
              sketchInfo={sketchInfo}
              pdfDoc={pdfDoc}
            />
          )}
          {activeStep == 10 && (
            <Test
              setSketchInfo={setSketchInfo}
              sketchInfo={sketchInfo}
              pdfDoc={pdfDoc}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
