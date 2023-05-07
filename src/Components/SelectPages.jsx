import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import Image from "next/image";
// step 2
export default function SelectPages({
  pdfDocs,
  setPdfDoc,
  setActiveStep,
  fileNames,
}) {
  const [selectedPages, setSelectedPages] = useState([]);
  const [extracted, setExtracted] = useState(false);
  const [pages, setPages] = useState([]);
  const [loaded, setLoaded] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [files, setFiles] = useState([]);
  // get pdf files and set them to document
  // get all pdf and set loaded(true)
  useEffect(() => {
    const getAllPdfs = async () => {
      for (let i = 0; i < pdfDocs.length; i++) {
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
  }, [pdfDocs]);
  // set the selected pdf to the first item in the names array
  // get pages from pdf
  useEffect(() => {
    if (loaded && pdfDocs) {
      const extractPages = () => {
        pdfDocs.map((pdfDoc, i) => {
          let SoloPages = pdfDoc.getPages().map((page, index) => ({
            index: index + 1,
            name: `${fileNames[i]}--> page ${index + 1}`,
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
    pdfDocs.forEach((doc, i) => {
      selectedPages.forEach((selectedObj) => {
        if (selectedObj.file === i) {
          selectedObj.pages.forEach((page) => {
            const copyPage = async () => {
              const copiedPage = await extractedPdfDoc.copyPages(doc, [
                page - 1,
              ]);
              extractedPdfDoc.addPage(copiedPage[0]);
            };
            copyPage();
          });
        }
      });
    });
    await extractedPdfDoc.save();
    extractedPdfDoc.removePage(0);
    await extractedPdfDoc.save();
    setPdfDoc(extractedPdfDoc);
    setActiveStep(3);
  };
  const [err, setErr] = useState(false);
  const handleNext = () => {
    if (selectedPages.length === 0) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000);
    } else {
      handleExtractAndCombine();
    }
  };
  useEffect(() => {
    setSelectedPdf(fileNames[0]);
    setSelectedDoc(0);
  }, []);
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <Heading>
        Select which page(s) from your pdf that you want for this specific line
        item
      </Heading>
      <SubHeading>
        Select the page(s) you need and click next, to go back or add more click
        the plus button
      </SubHeading>
      {/* render pages */}
      <TabDiv className="flex justify-start items-center h-[80px] overflow-x-scroll w-[1000px] border border-black my-2 rounded-tl-md rounded-tr-md">
        {fileNames.map((name, index) => (
          <TabOptions
            className="hover:bg-[##707070] shadow-md"
            style={{
              backgroundColor: name === selectedPdf && "#0B7189",
              color: name === selectedPdf && "white",
            }}
            key={index}
            onClick={() => {
              setSelectedDoc(index), setSelectedPdf(name);
            }}
          >
            {name}
          </TabOptions>
        ))}
      </TabDiv>
      <PagesDiv className="flex w-[1000px] h-[400px] relative border border-black mb-4 overflow-y-auto rounded-br-md rounded-bl-md">
        {extracted &&
          pages.map((el, i) => (
            <PagesDiv
              className="w-full h-full flex flex-col justify-center items-center"
              key={i}
              style={{
                display: i === selectedDoc ? "block" : "none",
              }}
            >
              <ul className="w-full h-full flex flex-col px-3 gap-2">
                <PdfTitle>{el.name}</PdfTitle>
                {el.map(({ index, name, selected }) => (
                  <div key={index} className="">
                    <li className="flex justify-between items-start font-medium border-b border-black py-3 px-2">
                      {name}
                      <div className="flex justify-center gap-2 items-center border border-red-200">
                        <StyledCheckbox
                          type="checkbox"
                          //   checked={selectedPages[i].pages.includes(index)}
                          onChange={() => handlePageSelection(i, index)}
                          className="w-[20px] h-[40px]"
                        />
                      </div>
                    </li>
                  </div>
                ))}
              </ul>
            </PagesDiv>
          ))}
      </PagesDiv>
      <ContinueBtn
        onClick={handleNext}
        className="bg-[#228CDB] hover:bg-[#0B7189]"
      >
        Extract Pages
      </ContinueBtn>
      {err && (
        <SubHeading style={{ color: "red" }}>
          Please select pages you would like to extract
        </SubHeading>
      )}
    </div>
  );
}

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
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
`;
const StyledCheckbox = styled.input.attrs({
  type: "checkbox",
})`
  width: 15px;
  cursor: pointer;
  height: 15px;
  float: right;
`;
const PdfTitle = styled.p`
  display: inline-block;
  color: black;
  font-weight: 700;
  white-space: nowrap;
`;
const TabDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  white-space: nowrap;
  height: 80px;
  overflow-x: scroll;
  margin-bottom: 10px;
  width: 1000px;
  padding-top: 5px;
  padding: 5px;
  gap: 10px;
  border: 1px solid black;
  margin: 20px;
  ::-webkit-scrollbar-track {
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
const PagesDiv = styled.div`
  ::-webkit-scrollbar-track {
    border-radius: 10px, 0px, 10px, 0px;
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
  margin-left: 10px;
  margin-right: 10px;
  font-weight: bold;
  :focus,
  :active {
    outline: none;
  }
`;
