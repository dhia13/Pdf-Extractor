import styled from "styled-components";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PDFDocument, PDFPage } from "pdf-lib";
const Step02 = ({ urlList, urList, setActiveStep, setPdfDoc }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [extracted, setExtracted] = useState(false);
  const [pages, setPages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [files, setFiles] = useState([]);
  // get pdf files and set them to document
  const handleGetFile = async (url) => {
    try {
      const res = await axios.put(
        "http://localhost:8000",
        { url: url },
        {
          responseType: "arraybuffer", // set the response type to arraybuffer
        }
      );
      const uint8Array = new Uint8Array(res.data);
      const pdfDoc = await PDFDocument.load(uint8Array);
      let pdfFiles = pdfDocs;
      pdfDocs.push(pdfDoc);
      setPdfDocs(pdfFiles);
    } catch (err) {
      console.log(err);
    }
  };
  // get all pdf and set loaded(true)
  useEffect(() => {
    const getAllPdfs = async () => {
      for (let i = 0; i < urlList.length; i++) {
        await handleGetFile(urlList[i]);
        const newfiles = files;
        newfiles.push(`file ${i}`);
        setFiles(newfiles);
      }
      setLoaded(true);
    };
    getAllPdfs();
    return () => {
      setLoaded(false);
    };
  }, [urlList]);
  // set the selected pdf to the first item in the names array
  // get pages from pdf
  useEffect(() => {
    if (loaded && pdfDocs) {
      const extractPages = () => {
        pdfDocs.map((pdfDoc, i) => {
          let SoloPages = pdfDoc.getPages().map((page, index) => ({
            index: index + 1,
            name: `file ${index + 1} --> page ${index + 1}`,
            selected: false,
          }));
          let newPages = pages;
          newPages.push(SoloPages);
          setPages(newPages);
        });
        setExtracted(true);
      };
      extractPages();
    }
    // setSelectedPdf([names[0]]);
    setSelectedDoc(0);
    return () => {
      setExtracted(false);
    };
  }, [loaded]);
  // page selection
  const handlePageSelection = async (i, index) => {
    const removeItemFromArray = (array, value) => {
      const newArray = array.filter((item) => item !== value);
      return newArray;
    };
    const removeArrayFromArray = (array, value) => {
      const newArray = array.filter((item) => item.file !== value);
      return newArray;
    };
    const findIndex = (p) => {
      for (let s = 0; s < selectedPages.length; s++) {
        if (selectedPages[s].file === p) {
          return s;
        }
      }
    };
    const n = findIndex(i);
    if (!selectedPages[n]) {
      let pdfSelected = {
        file: i,
        pages: [index],
      };
      const newPages = pdfSelected;
      setSelectedPages([...selectedPages, newPages]);
    } else {
      const DSPO = selectedPages[n];
      //remove page
      if (DSPO.pages.includes(index)) {
        DSPO.pages = removeItemFromArray(selectedPages[n].pages, index);
        const DocumentsObjectWithoutDSPO = removeArrayFromArray(
          selectedPages,
          i
        );
        if (DSPO.pages.length === 0) {
          setSelectedPages([...DocumentsObjectWithoutDSPO]);
        } else {
          setSelectedPages([...DocumentsObjectWithoutDSPO, DSPO]);
        }
      } else {
        DSPO.pages.push(index);
        const newPages = removeArrayFromArray(selectedPages, i);
        setSelectedPages([...newPages, DSPO]);
      }
    }
  };
  // file extraction and comb
  const handleExtractAndCombine = async () => {
    const extractedPdfDoc = await PDFDocument.create();
    for (let pd = 0; pd < pdfDocs.length; pd++) {
      for (let pdp = 0; pdp < pdfDocs[pd].getPageCount() + 1; pdp++) {
        for (let sp = 0; sp < selectedPages.length; sp++) {
          for (let p = 0; p < selectedPages[sp].pages.length; p++) {
            if (
              pd === selectedPages[sp].file &&
              pdp === selectedPages[sp].pages[p]
            ) {
              const page = await extractedPdfDoc.copyPages(pdfDocs[pd], [pdp]);
              extractedPdfDoc.addPage(page[0]);
            }
          }
        }
      }
      const newBlob = await extractedPdfDoc.save();
      const file = new File([newBlob], "testssPdf.pdf", {
        type: "application/pdf",
      });
      const pdfDocument = await PDFDocument.load(newBlob);

      setPdfDoc(pdfDocument);
      setActiveStep(3);
      // const url = URL.createObjectURL(file);
      // const link = document.createElement("a");
      // link.download = "newPdf.pdf";
      // link.href = url;
      // link.click();
      // console.log(extractedPdfDoc);
      // const finalPdf = await PDFDocument.load(newBlob);
    }
  };
  console.log(pdfDocs);
  return (
    <>
      <Heading>
        Select which page(s) from your pdf that you want for this specific line
        item
      </Heading>
      <SubHeading>
        Select the page(s) you need and click next, to go back or add more click
        the plus button
      </SubHeading>
      {/* render pages */}
      <TabDiv>
        {files.map((name, index) => (
          <TabOptions
            style={{
              backgroundColor: name === selectedPdf[0] && "#2994ff",
              color: name === selectedPdf[0] && "white",
            }}
            key={index}
            onClick={() => {
              setSelectedDoc(index), setSelectedPdf([name]);
            }}
          >
            {name}
          </TabOptions>
        ))}
      </TabDiv>
      <div className="flex w-full h-[400px] overflow-y-scroll relative">
        {extracted &&
          pages.map((el, i) => (
            <PagesDiv
              key={i}
              style={{
                display: i === selectedDoc ? "block" : "none",
              }}
            >
              <ul
                style={{
                  width: "100%",
                  height: "90%",
                }}
              >
                <PdfTitle>{el.name}</PdfTitle>
                <PdfTitle>
                  Total:
                  <BleuText>N/A</BleuText>
                </PdfTitle>
                <BleuText
                  style={{ fontWeight: "BOLD", textDecoration: "underline" }}
                >
                  Select All
                </BleuText>
                {el.map(({ index, name, selected }) => (
                  <div key={index}>
                    <li
                      style={{
                        fontWeight: "500",
                        margin: "5px",
                        fontSize: "13px",
                      }}
                    >
                      {name}
                      <StyledCheckbox
                        type="checkbox"
                        //   checked={selectedPages[i].pages.includes(index)}
                        onChange={() => handlePageSelection(i, index)}
                      />
                    </li>
                    <Divider2 />
                  </div>
                ))}
              </ul>
            </PagesDiv>
          ))}
      </div>
      <ContinueBtn onClick={handleExtractAndCombine}>
        extract and combine
      </ContinueBtn>
    </>
  );
};
export default Step02;

const Heading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 25px;
  line-height: 40px;
`;
const SubHeading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: 480;
  font-size: 16px;
  line-height: 40px;
  color: #707070;
`;
const ContinueBtn = styled.button`
  background: #2994ff;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
`;
const Divider2 = styled.div`
  border-bottom: 1px solid lightgray;
  // margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 3px;
  margin-right: 3px;
`;
const StyledCheckbox = styled.input.attrs({
  type: "checkbox",
})`
  width: 15px;
  height: 15px;
  float: right;
`;
const PdfTitle = styled.p`
  display: inline-block;
  color: black;
  font-weight: 700;
  margin-bottom: 10px;
  width: 80%;
  white-space: nowrap;
`;
const TabOptions = styled.button`
  flex: 0 0 auto;
  background-color: white;
  overflow: hidden;
  padding: 0 10px 0;
  margin-left: 30px;
  border-radius: 20px;
  cursor: pointer;
  color: gray;
  margin-bottom: 50px;
  width: 200px;
  height: 35px;
  white-space: nowrap;
  font-weight: bold;
  :focus,
  :active {
    outline: none;
  }
`;
const TabDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  white-space: nowrap;
  height: 70px;
  margin-top: 10px;

  ::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar {
    height: 7px !important;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #2994ff;
  }
`;
const PagesDiv = styled.div`
  overflow-y: auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  margin-top: 10px;
  ::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar {
    width: 7px !important;
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #2994ff;
  }
`;
const BleuText = styled.span`
  color: #2491ff;
  display: inline-block;
`;
