import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
const Step4 = ({ sketchInfo, handleSelectPageForDrawing, pdfDoc }) => {
  console.log({ sketchInfo, pdfDoc });
  const [file, setFile] = useState(null);
  const Doc2File = async () => {
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], "testssPdf.pdf", {
      type: "application/pdf",
    });
    setFile(file);
  };
  useEffect(() => {
    Doc2File();
  }, []);
  const pdfRef = useRef(null);
  const [page, setPage] = useState(1);
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
  const exportPdfPages = async () => {
    const canvasWidth = pdfRef.current.clientWidth;
    const canvasHeight = pdfRef.current.clientHeight;
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = canvasWidth;
    mergedCanvas.height = canvasHeight;
    const mergedCtx = mergedCanvas.getContext("2d");
    const pdf = new jsPDF({
      orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
      unit: "px",
      format: [canvasWidth, canvasHeight],
    });

    for (let i = 0; i < sketchInfo.pages.length; i++) {
      setPage(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const page = sketchInfo.pages[i];
      mergedCtx.drawImage(pdfRef.current, 0, 0, canvasWidth, canvasHeight);
      page.sketches.shapes.forEach((shape) => {
        shape.draw(mergedCanvas, 1);
      });
      if (i !== 0) {
        pdf.addPage();
      }
      pdf.addImage(
        mergedCanvas.toDataURL("image/jpeg"),
        "JPEG",
        0,
        0,
        canvasWidth,
        canvasHeight,
        null,
        null,
        null,
        null,
        null,
        null,
        {
          pageNumber: i + 1, // add page number to the image options
        }
      );
    }
    pdf.save("merged.pdf");
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full flex flex-col justify-center items-center absolute top-0 left-0 z-50">
        <Heading>You can modify pages by pressing on the pen</Heading>
        <SubHeading>download the pdf Raw or with changes</SubHeading>
        <SubHeading>
          Note : (you need to save drawings and plans before you go back or
          enable auto save )
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
      <>
        <Document file={file} className="opacity-0 absolute top-0 left-0 z-10">
          <Page
            pageNumber={page}
            canvasRef={pdfRef}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            // onLoadSuccess={() => setLoaded(!loaded)}
          />
        </Document>
      </>
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
