import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { PDFDocument } from "pdf-lib";
// import UploadModelStep from "../UploadModelStep";
const UploadModal = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInput = useRef(null);
  const [showPdfName, setShowPdfName] = useState(false);
  //  getting pdfDoc when file load (step 1)
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const fileName = event.target.files[0].name;
    setFileName(fileName);
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfBytes = new Uint8Array(fileReader.result);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      setPdfDoc(pdfDoc);
    };
    fileReader.readAsArrayBuffer(file);
    setShowPdfName(true);
  };
  // get pages when pdfDoc loads
  useEffect(() => {
    if (pdfDoc) {
      setPages(
        pdfDoc.getPages().map((page, index) => ({
          index: index + 1,
          name: `${fileName} --> page ${index + 1}`,
          selected: false,
        }))
      );
    }
  }, [pdfDoc]);
  // Page Selection (step 2.1)
  const handlePageSelection = (index) => {
    setSelectedPages((prevSelectedPages) => {
      const newSelectedPages = [...prevSelectedPages];
      const pageIndex = newSelectedPages.indexOf(index);
      if (pageIndex === -1) {
        newSelectedPages.push(index);
      } else {
        newSelectedPages.splice(pageIndex, 1);
      }
      return newSelectedPages;
    });
  };
  // extract pages from pdfDoc (step 2.2)
  const handleExtractPages = async () => {
    for (let i = pdfDoc.getPageCount() - 1; i >= 0; i -= 1) {
      if (!selectedPages.includes(i + 1)) {
        pdfDoc.removePage(i);
      }
    }
    await pdfDoc.save();
    setActiveStep(3);
  };
  // Create new file and download it (step 3)
  const handleDownload = async () => {
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], "testssPdf.pdf", {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = fileName + ".pdf";
    link.href = url;
    link.click();
  };
  return (
    <div className="w-[550px] flex justify-center items-center bg-cyan-200 rounded-md">
      <div className=" w-full h-[800px] flex justify-center items-center">
        <div className="w-[90%] flex justify-start items-center flex-col">
          {activeStep == 0 && (
            <>
              <Heading>How do you like to upload the plan</Heading>
              <button
                onClick={() => setActiveStep(1)}
                className="w-full h-[60px] text-white bg-[#2994ff] m-4 rounded-md hover:bg-cyan-600"
              >
                Upload new Pdf from computer
              </button>
            </>
          )}
          {activeStep == 1 && (
            <>
              <Heading>
                Let’s get started! Upload your plans to begin assigning tasks{" "}
              </Heading>
              <SubHeading>
                Click the done button when your are finished uploading your
                files.
              </SubHeading>
              <Divider />
              <Container1>
                <Wrapper className="flex justify-center items-center flex-col">
                  <UploadBtn onClick={() => fileInput.current.click()}>
                    <IoAddCircleSharp
                      style={{
                        position: "relative",
                        color: "#2491ff",
                        cursor: "pointer",
                      }}
                      size="50"
                    />
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={fileInput}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </UploadBtn>
                  <Paratext>
                    Click the add button to upload your pdf file
                  </Paratext>
                </Wrapper>
              </Container1>
              {showPdfName && (
                <>
                  <PdfSelected>
                    <p style={{ margin: "10px" }}>{fileName}</p>
                    <FaRegFilePdf
                      style={{ color: "#bd2031", margin: "10px" }}
                      size="20"
                    />
                  </PdfSelected>
                </>
              )}
              <button
                className="w-full h-[60px] text-white bg-[#2994ff] m-4 rounded-md hover:bg-cyan-600"
                onClick={() => {
                  pdfDoc && setActiveStep(2);
                }}
              >
                Continue to select pages
              </button>
            </>
          )}
          {activeStep == 2 && (
            <>
              <div className="flex justify-center items-center gap-4">
                <img
                  src="/images/back.png"
                  alt="back"
                  width="32px"
                  height="32px"
                  onClick={() => setActiveStep(1)}
                  className="cursor-pointer"
                />
                <Heading>
                  Select which page(s) from your pdf that you want for this
                  specific line item
                </Heading>
              </div>
              <SubHeading>
                Select the page(s) you need and click next, to go back or add
                more click the plus button
              </SubHeading>
              <Divider />
              <div style={{ display: "flex", margin: "5px" }}>
                Total pages :<BleuText>{pdfDoc.getPageCount()} </BleuText>
                <FaRegFilePdf
                  style={{
                    color: "red",
                    cursor: "pointer",
                    marginLeft: "30px",
                  }}
                  size="24"
                />
              </div>
              <Container1>
                <Wrapper style={{ overflowY: "auto" }}>
                  {pdfDoc ? (
                    <>
                      <div style={{ margin: "10px" }}>
                        <BleuText>{fileName}</BleuText>
                      </div>
                      <ul style={{ margin: "10px" }}>
                        <Divider2 />
                        {pages.map(({ index, name, selected }) => (
                          <div key={index}>
                            <li style={{ fontWeight: "500", margin: "5px" }}>
                              {name}
                              <StyledCheckbox
                                type="checkbox"
                                checked={selectedPages.includes(index)}
                                onChange={() => handlePageSelection(index)}
                              />
                            </li>
                            <Divider2 />
                          </div>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div>No PDF loaded</div>
                  )}
                </Wrapper>
              </Container1>
              <ContinueBtn
                onClick={() => {
                  handleExtractPages();
                }}
              >
                Create New Pdf
              </ContinueBtn>
            </>
          )}
          {activeStep == 3 && (
            <>
              <div className="flex justify-center items-center gap-4">
                <img
                  src="/images/back.png"
                  alt="back"
                  width="32px"
                  height="32px"
                  onClick={() => setActiveStep(2)}
                  className="cursor-pointer"
                />
                <Heading>Let’s go! Download your new Pdf File</Heading>
              </div>
              <Divider />
              <ContinueBtn
                onClick={() => {
                  handleDownload();
                }}
              >
                Download File
              </ContinueBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
const BleuText = styled.p`
  color: #2491ff;
  font-weight: 500;
`;
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
  color: #707070;
  text-align: "center";
`;
const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  background-color: #f4faff;
  width: 100%;
  height: 400px;
  border-radius: 10px;
  border: 0.25px solid lightgray;
  box-shadow: 0px 6px 15px rgba(47, 128, 237, 0.1);

  // overflow-x: auto;
`;
const UploadBtn = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 50px;
`;
const ContinueBtn = styled.button`
  background: #2994ff;
  border: 1px solid #2994ff;
  padding: 8px 150px;
  border-radius: 5px;
  margin-top: 20px;
  color: white;
  float: left;
  margin-top: 24px;
  width: inherit;
`;
const Container1 = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Divider = styled.div`
  border-bottom: 1px solid lightgray;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
`;
const Divider2 = styled.div`
  border-bottom: 1px solid lightgray;
  margin-top: 10px;
  margin-bottom: 5px;
  margin-left: 3px;
  margin-right: 3px;
`;
const Paratext = styled.p`
  display: flex;
  justify-content: center;
  padding-top: 10px;
  color: #707070;
  font-weight: 450;
  padding-bottom: 20px;
`;
const PdfSelected = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #2994ff;
  border: 1px solid #2994ff;
  cursor: pointer;
  border-radius: 32px;
  width: 205px;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  height: 35px;
  margin: 10px;
`;
const StyledCheckbox = styled.input.attrs({
  type: "checkbox",
})`
  width: 20px;
  height: 20px;
  float: right;
`;
{
  /* {activeStep == 0.5 && (
          <UploadModelStep
            urlList={urlList}
            pdfDoc={pdfDoc}
            setPdfDoc={setPdfDoc}
            setActiveStep={setActiveStep}
          />
        )} */
}
{
  /* {activeStep == 0.75 && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "90%",
              display: "flex",
              justifyContent: "start",
              alignItems: "start",
              flexDirection: "column",
            }}
          >
            <IoIosArrowBack
              style={{
                position: "relative",
                color: "#2491ff",
                cursor: "pointer",
              }}
              size="20"
              onClick={() => setActiveStep(1)}
            />
            <Divider />
            <div style={{ display: "flex", margin: "5px" }}>
              Total pages :<BleuText>{pdfDoc.getPageCount()} </BleuText>
              <FaRegFilePdf
                style={{
                  color: "red",
                  cursor: "pointer",
                  marginLeft: "30px",
                }}
                size="24"
              />
            </div>
            <Container1>
              <Wrapper style={{ overflowY: "auto" }}>
                {pdfDoc ? (
                  <>
                    <div style={{ margin: "10px" }}>
                      PDF loaded
                      <BleuText>
                        ({pdfDoc.getPageCount()} pages . lineitem name:{" "}
                        {fileName})
                      </BleuText>
                    </div>
                    <ul style={{ margin: "10px" }}>
                      <Divider2 />
                      {pages.map(({ index, name }) => (
                        <div key={index}>
                          <li style={{ fontWeight: "500", margin: "5px" }}>
                            {name}
                          </li>
                          <Divider2 />
                        </div>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div>No PDF loaded</div>
                )}
              </Wrapper>
            </Container1>
            <ContinueBtn onClick={() => setActiveStep(3)}>Continue</ContinueBtn>
          </div>
        </div>
      )} */
}
