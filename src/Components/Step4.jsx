import styled from "styled-components";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";
import { pdfjs } from "react-pdf";
const Step4 = ({ sketchInfo, handleSelectPageForDrawing, pdfDoc }) => {
  console.log({ sketchInfo, pdfDoc });

  const handleDownloadRaw = async () => {
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], "testssPdf.pdf", {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = "kizaruEdit.pdf";
    link.href = url;
    link.click();
  };
  async function exportPdfPages() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const loadingTask = pdfjs.getDocument("/test.pdf");
    const pdf = await loadingTask.promise;

    // Load information from the first page.
    const page = await pdf.getPage(1);
    console.log(page);
    const scale = 1;
    const viewport = page.getViewport(scale);

    // Apply page dimensions to the `<canvas>` element.
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page into the `<canvas>` element.
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext);
    console.log("Page rendered!");
    // const page = await pdfDoc.getPage(1);
    // console.log(page);
    // // Set the canvas dimensions to match the page size
    // const viewport = [page.getWidth(), page.getHeight()];
    // canvas.width = viewport.width;
    // canvas.height = viewport.height;

    // // Render the page content on the canvas
    // const renderContext = {
    //   canvasContext: ctx,
    //   viewport: viewport,
    // };
    // await page.render(renderContext).promise;

    // // Draw a red rectangle on the canvas
    // ctx.fillStyle = "red";
    // ctx.fillRect(100, 100, 50, 50);

    // // Save the canvas content as an image or PDF file
    // canvas.toBlob((blob) => {
    //   saveAs(blob, "page1.pdf");
    // }, "application/pdf");
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Heading>You can modify pages by pressing on the pen</Heading>
      <SubHeading>download the pdf Raw or with changes</SubHeading>
      <SubHeading>
        Note : (you need to save drawings and plans before you go back or enable
        auto save )
      </SubHeading>
      {/* render pages */}
      <PagesDiv className="flex w-[1000px] h-[400px] relative flex-col justify-start items-start">
        {sketchInfo.pages.map((el, i) => (
          <li
            className="flex justify-between items-start font-medium flex-col w-full gap-1"
            key={i}
          >
            <div className="w-full flex justify-between items-center">
              {`Page ${i}`}
              <div className="flex justify-center gap-2 items-center cursor-pointer">
                <img
                  src={`/images/${el.edited ? "bluepen" : "pen"}.png`}
                  width={24}
                  height={24}
                  onClick={() => handleSelectPageForDrawing(i)}
                />
              </div>
            </div>
            <Divider2 />
          </li>
        ))}
      </PagesDiv>
      <ContinueBtn className="hover:bg-[#0B7189]" onClick={exportPdfPages}>
        Download Edited
      </ContinueBtn>
      <ContinueBtn className="hover:bg-[#0B7189]" onClick={handleDownloadRaw}>
        Download Raw
      </ContinueBtn>
    </div>
  );
};
export default Step4;

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
  background: #228cdb;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
  margin-bottom: 10px;
  width: 400px;
`;
const Divider2 = styled.div`
  border-bottom: 1px solid lightgray;
  // margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
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
  border-radius: 20px;
  cursor: pointer;
  color: gray;
  height: 35px;
  padding: 0 10px 0 10px;
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
  justify-content: start;
  align-items: center;
  white-space: nowrap;
  height: 70px;
  overflow-x: scroll;
  width: 100%;
  gap: 20px;
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
    background-color: #5fee8a;
  }
`;
const PagesDiv = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
