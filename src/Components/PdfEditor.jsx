import { useState } from "react";
import Step0 from "./Step0";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
const PdfEditor = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-200 rounded-md">
      <div className="  w-[1000px] h-full flex justify-center items-center">
        <div className="w-[90%] flex justify-start items-center flex-col">
          {activeStep == 0 && <Step0 setActiveStep={setActiveStep} />}
          {activeStep == 1 && (
            <Step1
              fileNames={fileNames}
              setFileNames={setFileNames}
              pdfDocs={pdfDocs}
              setPdfDocs={setPdfDocs}
              setActiveStep={setActiveStep}
            />
          )}
          {activeStep == 2 && (
            <Step2
              pdfDocs={pdfDocs}
              setPdfDoc={setPdfDoc}
              setActiveStep={setActiveStep}
              fileNames={fileNames}
            />
          )}
          {activeStep == 3 && (
            <Step3
              setActiveStep={setActiveStep}
              pdfDoc={pdfDoc}
              setPdfDocs={setPdfDocs}
              setFileNames={setFileNames}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
