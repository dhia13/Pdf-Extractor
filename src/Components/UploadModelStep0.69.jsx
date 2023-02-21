import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
const UploadModelStep = ({ urlList, pdfDoc, setPdfDoc, setActiveStep }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [extracted, setExtracted] = useState(false);
  const [pages, setPages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const names = urlList.map((url, index) => {
    const urlParts = url.url.split("/");
    const pdfName = urlParts[urlParts.length - 1];
    return pdfName;
  });
  console.log(names);
  console.log("selected", selectedPages);
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
      console.log("selected pages exist but not for the file");
      let pdfSelected = {
        file: i,
        pages: [index],
      };
      const newPages = pdfSelected;
      setSelectedPages([...selectedPages, newPages]);
    } else {
      console.log("selected page for the file exist number", i);

      console.log("new order", n);
      const DSPO = selectedPages[n];
      //remove page
      if (DSPO.pages.includes(index)) {
        DSPO.pages = removeItemFromArray(selectedPages[n].pages, index);
        console.log("New document selected pages object", DSPO);
        const DocumentsObjectWithoutDSPO = removeArrayFromArray(
          selectedPages,
          i
        );
        if (DSPO.pages.length === 0) {
          console.log("newpages", DocumentsObjectWithoutDSPO);
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
  const handleExtractAndCombine = async () => {
    const newPdfDocs = [];
    for (let s = 0; s < pdfDocs.length; s++) {
      const extractedPdfDoc = await PDFDocument.create();
      console.log(selectedPages[s]);
      if (selectedPages[s] && selectedPages[s].pages.length > 0) {
        console.log("copying pages from", s, "document");
        console.log("doc page count", pdfDocs[s].getPageCount());
        for (let i = 0; i < pdfDocs[s].getPageCount(); i++) {
          if (selectedPages[s].pages.includes(i + 1)) {
            const [copiedPage] = await extractedPdfDoc.copyPages(pdfDocs[s], [
              i,
            ]);
            extractedPdfDoc.addPage(copiedPage);
          }
        }
      }
      console.log("extractedPdfDoc", extractedPdfDoc);
      if (extractedPdfDoc.getPageCount() > 0) {
        const extractedPdfBytes = await extractedPdfDoc.save();
        newPdfDocs.push(await PDFDocument.load(extractedPdfBytes));
      }
    }
    for (let s = 0; s < pdfDocs.length; s++) {
      await pdfDocs[s].save();
    }
    const combinePDFs = async (pdfDocs) => {
      const combinedPdf = await PDFDocument.create();
      const copyPages = async (source, destination) => {
        const pages = await destination.copyPages(
          source,
          source.getPageIndices()
        );
        pages.forEach((page) => {
          destination.addPage(page);
        });
      };
      for (let i = 0; i < pdfDocs.length; i++) {
        await copyPages(pdfDocs[i], combinedPdf);
      }
      return combinedPdf.save();
    };
    const combinedPdfBytes = await combinePDFs(newPdfDocs);
    console.log(combinedPdfBytes);
    const finalPdf = await PDFDocument.load(combinedPdfBytes);
    setPdfDoc(finalPdf);
    setActiveStep(0.75);
    console.log("all ran smoothly");
  };

  console.log(pdfDocs);
  console.log(
    "pdfDoc coming soon now you can manupulate your line item ",
    pdfDoc
  );
  const handleGetFile = async (url) => {
    const headers = {
      Authorization: "Bearer " + localStorage.getItem("token"),
      Accept: "application/pdf",
    };
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}getPdfFileBlob`,
        {
          pdfUrl:url
        { responseType: "arraybuffer", headers }
      );
      const pdfDoc = await PDFDocument.load(res.data);
      let pdfFiles = pdfDocs;
      pdfDocs.push(pdfDoc);
      setPdfDocs(pdfFiles);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (loaded && pdfDocs) {
      const extractPages = () => {
        pdfDocs.map((pdfDoc, i) => {
          let SoloPages = pdfDoc.getPages().map((page, index) => ({
            index: index + 1,
            name: ${names[i]} --> page ${index + 1},
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
  }, [loaded]);
  useEffect(() => {
    const getAllPdfs = async () => {
      for (let i = 0; i < urlList.length; i++) {
        await handleGetFile(urlList[i].url);
      }
      setLoaded(true);
    };
    getAllPdfs();
  }, [urlList]);
  const [selectedDoc, setSelectedDoc] = useState(0);
  return (
    <div style={{ margin: "30px", height: "500px" }}>
      <Heading>
        Let’s get started! Upload your plans to begin assigning tasks{" "}
      </Heading>
      <SubHeading>
        Click the done button when your are finished uploading your files.
      </SubHeading>
      {/* render pages */}
      <div>
        {names.map((name, index) => (
          <OptionURL key={index} onClick={() => setSelectedDoc(index)}>
            {name}
          </OptionURL>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "400px",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {extracted &&
          pages.map((el, i) => (
            <div
              key={i}
              style={{
                overflowY: "auto",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "1px solid",

                display: i === selectedDoc ? "block" : "none",
              }}
            >
              <ul
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Divider2 />
                <OptionURL>{names[i]}</OptionURL>
                <Divider2 />
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
            </div>
          ))}
      </div>

      <ContinueBtn onClick={handleExtractAndCombine}>
        extract and combine
      </ContinueBtn>
    </div>
  );
};
export default UploadModelStep;

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

const ContinueBtn = styled.button`
  background: #2994ff;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;

  color: white;
  float: left;
  margin-top: 30px;
`;

const Divider2 = styled.div`
  border-bottom: 1px solid lightgray;
  // margin-top: 10px;
  margin-bottom: 5px;
  margin-left: 3px;
  margin-right: 3px;
`;

const StyledCheckbox = styled.input.attrs({
  type: "checkbox",
})`
  width: 20px;
  height: 20px;
  float: right;
`;

const OptionURL = styled.button`
  display: inline-block;
  padding: 10px;
  margin-left: 30px;
  background-color: #2994ff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
  margin-bottom: 10px;
`;
import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
const UploadModelStep = ({ urlList, pdfDoc, setPdfDoc, setActiveStep }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfDocs, setPdfDocs] = useState([]);
  const [extracted, setExtracted] = useState(false);
  const [pages, setPages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const names = urlList.map((url, index) => {
    const urlParts = url.url.split("/");
    const pdfName = urlParts[urlParts.length - 1];
    return pdfName;
  });
  console.log(names);
  console.log("selected", selectedPages);
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
      console.log("selected pages exist but not for the file");
      let pdfSelected = {
        file: i,
        pages: [index],
      };
      const newPages = pdfSelected;
      setSelectedPages([...selectedPages, newPages]);
    } else {
      console.log("selected page for the file exist number", i);

      console.log("new order", n);
      const DSPO = selectedPages[n];
      //remove page
      if (DSPO.pages.includes(index)) {
        console.log(removing page number ${index} from file ${i});
        DSPO.pages = removeItemFromArray(selectedPages[n].pages, index);
        console.log("New document selected pages object", DSPO);
        const DocumentsObjectWithoutDSPO = removeArrayFromArray(
          selectedPages,
          i
        );
        if (DSPO.pages.length === 0) {
          console.log("newpages", DocumentsObjectWithoutDSPO);
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
  const handleExtractAndCombine = async () => {
    const newPdfDocs = [];
    for (let s = 0; s < pdfDocs.length; s++) {
      const extractedPdfDoc = await PDFDocument.create();
      console.log(selectedPages[s]);
      if (selectedPages[s] && selectedPages[s].pages.length > 0) {
        console.log("copying pages from", s, "document");
        console.log("doc page count", pdfDocs[s].getPageCount());
        for (let i = 0; i < pdfDocs[s].getPageCount(); i++) {
          if (selectedPages[s].pages.includes(i + 1)) {
            const [copiedPage] = await extractedPdfDoc.copyPages(pdfDocs[s], [
              i,
            ]);
            extractedPdfDoc.addPage(copiedPage);
          }
        }
      }
      console.log("extractedPdfDoc", extractedPdfDoc);
      if (extractedPdfDoc.getPageCount() > 0) {
        const extractedPdfBytes = await extractedPdfDoc.save();
        newPdfDocs.push(await PDFDocument.load(extractedPdfBytes));
      }
    }
    for (let s = 0; s < pdfDocs.length; s++) {
      await pdfDocs[s].save();
    }
    const combinePDFs = async (pdfDocs) => {
      const combinedPdf = await PDFDocument.create();
      const copyPages = async (source, destination) => {
        const pages = await destination.copyPages(
          source,
          source.getPageIndices()
        );
        pages.forEach((page) => {
          destination.addPage(page);
        });
      };
      for (let i = 0; i < pdfDocs.length; i++) {
        await copyPages(pdfDocs[i], combinedPdf);
      }
      return combinedPdf.save();
    };
    const combinedPdfBytes = await combinePDFs(newPdfDocs);
    console.log(combinedPdfBytes);
    const finalPdf = await PDFDocument.load(combinedPdfBytes);
    setPdfDoc(finalPdf);
    setActiveStep(0.75);
    console.log("all ran smoothly");
  };

  console.log(pdfDocs);
  console.log(
    "pdfDoc coming soon now you can manupulate your line item ",
    pdfDoc
  );
  useEffect(() => {
    if (pdfDoc instanceof PDFDocument) {
      console.log(Number of pages: ${pdfDoc.getPages().length});
      // pdfDoc.saveAs("combined.pdf"); // To download the combined PDF
    }
  }, [pdfDoc]);
  const handleGetFile = async (url) => {
    const headers = {
      Authorization: "Bearer " + localStorage.getItem("token"),
      Accept: "application/pdf",
    };
    try {
      const res = await axios.put(
        ${process.env.NEXT_PUBLIC_API_URL}getPdfFileBlob,
        {
          pdfUrl: https://handle-pdf-photos-project-through-compleated-task.s3.amazonaws.com/${url},
        },
        { responseType: "arraybuffer", headers }
      );
      const pdfDoc = await PDFDocument.load(res.data);
      let pdfFiles = pdfDocs;
      pdfDocs.push(pdfDoc);
      setPdfDocs(pdfFiles);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (loaded && pdfDocs) {
      const extractPages = () => {
        pdfDocs.map((pdfDoc, i) => {
          let SoloPages = pdfDoc.getPages().map((page, index) => ({
            index: index + 1,
            name: ${names[i]} --> page ${index + 1},
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
  }, [loaded]);
  useEffect(() => {
    const getAllPdfs = async () => {
      for (let i = 0; i < urlList.length; i++) {
        await handleGetFile(urlList[i].url);
      }
      setLoaded(true);
    };
    getAllPdfs();
  }, [urlList]);
  const [selectedDoc, setSelectedDoc] = useState(0);
  return (
    <div style={{ margin: "30px", height: "500px" }}>
      <Heading>
        Let’s get started! Upload your plans to begin assigning tasks{" "}
      </Heading>
      <SubHeading>
        Click the done button when your are finished uploading your files.
      </SubHeading>
      {/* render pages */}
      <div>
        {names.map((name, index) => (
          <OptionURL key={index} onClick={() => setSelectedDoc(index)}>
            {name}
          </OptionURL>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "400px",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {extracted &&
          pages.map((el, i) => (
            <div
              key={i}
              style={{
                overflowY: "auto",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "1px solid",

                display: i === selectedDoc ? "block" : "none",
              }}
            >
              <ul
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Divider2 />
                <OptionURL>{names[i]}</OptionURL>
                <Divider2 />
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
            </div>
          ))}
      </div>

      <ContinueBtn onClick={handleExtractAndCombine}>
        extract and combine
      </ContinueBtn>
    </div>
  );
};
export default UploadModelStep;

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

const ContinueBtn = styled.button`
  background: #2994ff;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;

  color: white;
  float: left;
  margin-top: 30px;
`;

const Divider2 = styled.div`
  border-bottom: 1px solid lightgray;
  // margin-top: 10px;
  margin-bottom: 5px;
  margin-left: 3px;
  margin-right: 3px;
`;

const StyledCheckbox = styled.input.attrs({
  type: "checkbox",
})`
  width: 20px;
  height: 20px;
  float: right;
`;

const OptionURL = styled.button`
  display: inline-block;
  padding: 10px;
  margin-left: 30px;
  background-color: #2994ff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
  margin-bottom: 10px;
`;