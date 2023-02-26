import { useState } from "react";

import Step0 from "./Step0";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step02 from "./Step02";
import Step3 from "./Step3";
import Step01 from "./Step01";
const PdfEditor = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [links, setLinks] = useState([]);
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200 rounded-md">
      <div className=" w-full h-full flex justify-center items-center">
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
            />
          )}
          {activeStep == 0.1 && (
            <Step01
              setLinks={setLinks}
              setActiveStep={setActiveStep}
              links={links}
            />
          )}
          {activeStep == 0.2 && (
            <div className="flex justify-center items-center w-full h-full flex-col">
              <Step02
                urlList={links}
                setPdfDoc={setPdfDoc}
                setActiveStep={setActiveStep}
              />
            </div>
          )}
          {activeStep == 3 && (
            <Step3 setActiveStep={setActiveStep} pdfDoc={pdfDoc} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
