import styled from "styled-components";
import { Modal } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa";
import Lottie from "react-lottie";
import animationData from "../../../public/animation.json";
import { IoIosArrowBack } from "react-icons/io";
import { AiFillCheckCircle } from "react-icons/ai";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import { useParams } from "react-router";
import pdfjsLib from "pdfjs-dist";
import UploadModelStep from "../UploadModelStep";
const UploadModal = ({ modalOpen, setModalOpen, selectedNode, urlList }) => {
  const [activeStep, setActiveStep] = useState(0.5);
  ///////
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInput = useRef(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState("");
  const [files, setFiles] = useState("");

  const handleUpload = async () => {
    var bodyFormData = new FormData();
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], `${selectedNode.Name}.pdf`, {
      type: "application/pdf",
    });
    bodyFormData.append("PID", selectedNode.PID);
    bodyFormData.append("LNID", selectedNode.LNID);
    bodyFormData.append("file", file);
    bodyFormData.append("Token", localStorage.getItem("token"));

    axios({
      method: "post",
      url: "https://django.construct-ai-photo-handler.com/api/add-plain-pdf-to-project",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        //handle success
        // console.log("RESPONSE", response);
      })
      .catch(function (err) {
        //handle error
        console.log(err);
      });
  };
  /////scall
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [feetInches, setFeetInches] = useState("");

  const handleFeetChange = (event) => {
    setFeet(event.target.value);
    convertToFeetInches(inches, event.target.value);
  };

  const handleInchesChange = (event) => {
    setInches(event.target.value);
    convertToFeetInches(feet, event.target.value);
  };

  const convertToFeetInches = (feet, inches) => {
    let totalInches = feet * 12 + Number(inches);
    let feetResult = Math.floor(totalInches / 12);
    let inchesResult = totalInches % 12;
    setFeetInches(`${feetResult}'-${inchesResult}"`);
  };

  /////////////////////////()
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFiles(event.target.files[0]);
    const fileName = event.target.files[0].name;
    setFileName(fileName);
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfBytes = new Uint8Array(fileReader.result);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      setPdfDoc(pdfDoc);
      setPdfBlob(pdfBytes);
      console.log(pdfDoc);
      console.log(pdfBytes);
    };
    fileReader.readAsArrayBuffer(file);
    setShowPdf(true);
  };

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
  //look here
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

  const handleExtractPages = async () => {
    for (let i = pdfDoc.getPageCount() - 1; i >= 0; i -= 1) {
      if (!selectedPages.includes(i + 1)) {
        pdfDoc.removePage(i);
      }
    }

    await pdfDoc.save();
  };
  //SUCCESS TIMER
  useEffect(() => {
    if (activeStep === 4) {
      const timeoutId = setTimeout(() => {
        setModalOpen(false);
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [activeStep, setActiveStep]);

  return (
    <Modal
      size={activeStep === 4 ? "sm" : "lg"}
      show={modalOpen}
      // onHide={setModalOpen(false)}
      keyboard={false}
      centered={true}
      backdrop="static"
    >
      <ModalTab>
        <IoMdClose
          style={{ position: "absolute", right: "38px", cursor: "pointer" }}
          onClick={() => setModalOpen(false)}
          size="25"
          color="#2491ff"
        />
      </ModalTab>
      <Modal.Body>
        {/* this block for athe tap with two senarios uploading from computer or uploding from existin pdfs */}
        {/* {
                    activeStep == 0 &&
                    <div style={{ width: "100%", height: "400px", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "start", alignItems: "center", flexDirection: "column" }}>
                            <Heading style={{ textAlign: "center" }}>How do you like to upload the plan</Heading>
                            <SubHeading style={{ textAlign: "center" }}>Select pages from existing plan or upload a new plan</SubHeading>
                            <ContinueBtn2 onClick={() => setActiveStep(0.5)} >Select Pages from existing plan</ContinueBtn2>
                            <ContinueBtn3 onClick={() => setActiveStep(1)} >Upload new Pdf from computer</ContinueBtn3>
                        </div>
                    </div>
                } */}
        {activeStep == 0.5 && (
          <UploadModelStep
            urlList={urlList}
            pdfDoc={pdfDoc}
            setPdfDoc={setPdfDoc}
            setActiveStep={setActiveStep}
          />
        )}
        {activeStep == 0.75 && (
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
                  top: "-30px",
                }}
                size="30"
                onClick={() => setActiveStep(0.5)}
              />
              <Heading>
                Before you confirm, make sure you have selected all the pages
                you want for this line item
              </Heading>
              <SubHeading>
                If there are pages that you have missed/ want to remove click
                the back arrow
              </SubHeading>
              <Divider />

              <PdfTitle>
                {" "}
                Total pages : <BleuText>{pdfDoc.getPageCount()}</BleuText>{" "}
              </PdfTitle>
              <PdfTitle>
                {" "}
                lineitem name: <BleuText>{selectedNode.Name}</BleuText>{" "}
              </PdfTitle>
              {/* <FaRegFilePdf style={{ color: "red", cursor: "pointer", marginLeft: "30px" }} size="24" /> */}

              <Container1>
                <Wrapper style={{ overflowY: "auto" }}>
                  {pdfDoc ? (
                    <>
                      <ul style={{ margin: "10px" }}>
                        {pages.map(({ index, name }) => (
                          <div key={index}>
                            <li style={{ fontWeight: "500", margin: "5px" }}>
                              {selectedNode.Name}
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

              <ContinueBtn
                onClick={() => {
                  handleUpload();
                  setActiveStep(4);
                }}
              >
                Confirm
              </ContinueBtn>
            </div>
          </div>
        )}
        {activeStep == 1 && (
          <div
            style={{
              width: "100%",
              height: "500px",
              display: "flex",
              justifyContent: "center",
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
              <Heading>
                Let’s get started! Upload your plans to begin assigning tasks{" "}
              </Heading>
              <SubHeading>
                Click the done button when your are finished uploading your
                files.
              </SubHeading>
              <Divider />
              <Container1>
                <Wrapper>
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
              {showPdf && (
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
              <ContinueBtn
                onClick={() => {
                  pdfDoc && setActiveStep(2);
                }}
              >
                Continuce
              </ContinueBtn>
            </div>
          </div>
        )}
        {activeStep == 2 && (
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
              <Heading>
                Select which page(s) from your pdf that you want for this
                specific line item
              </Heading>
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
                        PDF loaded
                        <BleuText>
                          ({pdfDoc.getPageCount()} pages . lineitem name:{" "}
                          {selectedNode.Name})
                        </BleuText>
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
                  handleExtractPages(), setActiveStep(3);
                }}
              >
                Continue
              </ContinueBtn>
            </div>
          </div>
        )}
        {activeStep == 3 && (
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
                onClick={() => setActiveStep(2)}
              />
              <Heading>
                Let’s get started! Upload your plans to begin assigning tasks{" "}
              </Heading>
              <SubHeading>
                Click the done button when your are finished uploading your
                files.
              </SubHeading>
              <Divider />
              <Container1>
                <Wrapper>
                  {/* <PlanPic><img src={'/plan.png'} alt='proto'style={{width:"100%",height:"100%"}}/></PlanPic>  */}
                  {/* firstPageImage */}

                  <div>
                    <Heading style={{ margin: "10px", textAlign: "center" }}>
                      What is the scale of the plan?
                    </Heading>
                    <BleuText style={{ margin: "10px" }}>Scale *</BleuText>
                    <div
                      style={{
                        display: "fLex",
                        flexDirection: "row",
                        justifyContent: "spaceAround",
                        margin: "10px",
                      }}
                    >
                      <div>
                        <ScallInputDiv> {feetInches} in</ScallInputDiv>
                      </div>
                      <div>
                        <label>
                          <ScallInput
                            type="number"
                            placeholder="0 ft"
                            onChange={handleFeetChange}
                          />
                        </label>
                      </div>
                      <div>
                        <label>
                          <ScallInput
                            type="number"
                            placeholder=" 0 in"
                            onChange={handleInchesChange}
                          />
                        </label>
                      </div>
                    </div>

                    <p style={{ margin: "10px", fontWeight: "bolder" }}>
                      Scale {feetInches} = {feet}" - {inches}"
                    </p>
                  </div>
                </Wrapper>
              </Container1>
              <ContinueBtn
                onClick={() => {
                  handleUpload();
                  setActiveStep(4);
                }}
              >
                Done
              </ContinueBtn>
            </div>
          </div>
        )}
        {activeStep == 4 && (
          <Container>
            <Lottie
              options={{
                animationData: animationData,
              }}
              style={{ position: "absolute" }}
              width={300}
              height={300}
            />
            <ConfirmIcon />
            <ConfirmHeading style={{ marginTop: "40px" }}>
              Success!
            </ConfirmHeading>
            <ScheduleSuggection style={{ marginTop: "40px" }}>
              You have successfully added a new plan to this line item.{" "}
              <br></br>
            </ScheduleSuggection>
            <div style={{ marginTop: "70px" }}></div>
          </Container>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UploadModal;
const BleuText = styled.span`
  color: #2491ff;
  font-weight: 500;
  display: inline-block;
`;

const ModalTab = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px 300px;
  color: #2491ff;
`;
const Heading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 25px;
  line-height: 40px;
  color: #000000;
`;
const SubHeading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: 480;
  font-size: 16px;
  line-height: 40px;
  color: #707070;
`;

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  background-color: #f4faff;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  border: 0.25px solid lightgray;
  box-shadow: 0px 6px 15px rgba(47, 128, 237, 0.1);
  // overflow-x: auto;
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px #2994ff;
    border-radius: 10px;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar {
    height: 7px !important;
    width: 7px;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px #2994ff;
    background-color: #2994ff;
  }
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
  margin-top: 100px;
`;
const ContinueBtn2 = styled.button`
  background: #2994ff;
  border: 1px solid #2994ff;
  padding: 10px 22px 10px 22px;
  border-radius: 5px;
  margin-top: 20px;
  color: white;
  float: left;
  margin-top: 50px;
  cursor: pointer;
`;
const ContinueBtn3 = styled.p`
  padding: 8px 10px;
  margin-top: 20px;
  color: #707070;
  margin-top: 50px;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
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
  weight: 450;
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
const ScallInput = styled.input`
  width: 100px;
  height: 40px;
  float: right;
  border: solid 1px lightgray;
  margin-left: 20px;
`;
const ScallInputDiv = styled.div`
  width: 100px;
  height: 40px;
  float: right;
  border: solid 1px lightgray;
  margin-left: 20px;
  text-align: center;
  line-height: 35px;
`;

const PlanPic = styled.div`
  width: 200px;
  height: 150px;
  float: left;
  background: white;
  border: 2px dashed black;
  margin: 20px;
`;
const ConfirmIcon = styled(AiFillCheckCircle)`
  color: #2994ff;
  font-size: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const ConfirmHeading = styled.h2`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 25px;
  line-height: 25px;
  color: #000000;
  text-align: center;
  padding: 20px 20px;
`;
const ScheduleSuggection = styled.p`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
  text-align: center;
  color: #707070;
`;
////////////////////////

// ///// remove pdf files
// const removeFile = (index) => {
//     files.splice(index, 1);
//     setFiles([...files]);
// };
// ///////end
const OptionURL = styled.button`
  display: inline-block;
  padding: 10px;
  margin: 5px;
  background-color: #2994ff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
`;
const PdfTitle = styled.p`
  display: inline-block;
  color: black;
  font-weight: 700;
  margin-bottom: 10px;
  width: 80%;
  white-space: nowrap;
`;
const Container = styled.div`
  padding: 0px 15px 20px 15px;
`;
