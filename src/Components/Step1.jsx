import styled from "styled-components";
import { useRef, useState } from "react";
import { IoAddCircleSharp } from "react-icons/io5";
import { PDFDocument } from "pdf-lib";
const Step1 = ({ fileNames, setFileNames, setPdfDocs, setActiveStep }) => {
  const [multiple, setMultiple] = useState(true);
  const handleFileChange = async (event) => {
    const newFileName = [];
    const pdfFiles = [];
    for (let i = 0; i < event.target.files.length; i++) {
      newFileName.push(event.target.files[i].name);
      pdfFiles.push(event.target.files[i]);
    }
    setFileNames(newFileName);
    async function convertToPdfDocuments(pdfFiles) {
      const pdfDocuments = [];

      for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDocument = await PDFDocument.load(pdfBytes);
        pdfDocuments.push(pdfDocument);
      }

      return pdfDocuments;
    }
    const newPdfDOcs = await convertToPdfDocuments(pdfFiles);
    setPdfDocs(newPdfDOcs);
  };
  const [err, setErr] = useState(false);
  const fileInput = useRef(null);
  const handleNext = () => {
    if (fileNames.length === 0) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000);
    } else {
      setActiveStep(2);
    }
  };
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <div className="flex  justify-center items-center gap-4">
        <img
          src="/images/back.png"
          alt="back"
          width="32px"
          height="32px"
          onClick={() => {
            setPdfDocs([]), setFileNames([]), setActiveStep(0);
          }}
          className="cursor-pointer"
        />
        <Heading>
          Let’s get started! Upload your Pdfs to begin modifying them
        </Heading>
      </div>
      <SubHeading>
        Click the done button when your are finished uploading your files.
      </SubHeading>
      <div className="flex justify-center items-center">
        <SubHeading>Multiple files </SubHeading>
        <input
          className="w-24 bg-red-500"
          type="checkbox"
          checked={multiple}
          onChange={() => setMultiple(!multiple)}
        />
      </div>
      <TabDiv>
        {fileNames &&
          fileNames.map((name, index) => (
            <TabOptions key={index}>{name}</TabOptions>
          ))}
      </TabDiv>
      <Container1>
        <Wrapper>
          <UploadBtn onClick={() => fileInput.current.click()}>
            <IoAddCircleSharp
              style={{
                position: "relative",
                color: "#1ef080",
                cursor: "pointer",
              }}
              size="50"
            />
            <input
              multiple={multiple}
              type="file"
              accept="application/pdf"
              ref={fileInput}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </UploadBtn>
          <Paratext>Click the add button to upload your pdf files</Paratext>
        </Wrapper>
      </Container1>
      <button
        className="w-[300px] h-[60px] text-white bg-[#228CDB] m-4 rounded-md hover:bg-[#0B7189]"
        onClick={() => handleNext()}
      >
        Continue to select pages
      </button>
      {err && (
        <SubHeading style={{ color: "red" }}>Please select a file</SubHeading>
      )}
    </div>
  );
};

export default Step1;
const Heading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 40px;
  color: #000000;
  text-align: "center";
`;
const SubHeading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: 480;
  font-size: 16px;
  line-height: 40px;
  color: #000000;
  text-align: "center";
`;
const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  background-color: #228cdb;
  width: 1000px;
  height: 400px;
  border-radius: 10px;
  border: 0.25px solid lightgray;
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  // overflow-x: auto;
`;
const UploadBtn = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 50px;
`;
const Container1 = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Paratext = styled.p`
  display: flex;
  justify-content: center;
  padding-top: 10px;
  color: black;
  font-size: 20px;
  font-weight: 450;
  padding-bottom: 20px;
`;
const TabDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  white-space: nowrap;
  height: 70px;
  overflow-x: scroll;
  margin-bottom: 10px;
  width: 1000px;
  gap: 20px;
  ::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #0b7189;
  }
  ::-webkit-scrollbar {
    height: 7px !important;
    background-color: white;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #5fee8a;
  }
`;
const TabOptions = styled.button`
  flex: 0 0 auto;
  background-color: #228cdb;
  overflow: hidden;
  border-radius: 10px;
  color: #ffffff;
  height: 50px;
  padding: 0px 10px 0px 10px;
  white-space: nowrap;
  font-weight: bold;
  :focus,
  :active {
    outline: none;
  }
`;
