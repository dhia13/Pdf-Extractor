import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { PDFDocument, PDFImage, StandardFonts, rgb } from "pdf-lib";
import { IoAddCircleSharp } from "react-icons/io5";
import { Document, Page, pdfjs } from "react-pdf";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  createImageBlob,
  getImageSize,
} from "./PaintComponents/ImagesManipulation";
// step 4
export default function EditPages({
  sketchInfo,
  handleSelectPageForDrawing,
  pdfDoc,
  setSketchInfo,
  autoSave,
  setAutoSave,
  setPdfDoc,
}) {
  const [file, setFile] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const Doc2File = async () => {
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], "testssPdf.pdf", {
      type: "application/pdf",
    });
    setFile(file);
  };
  useEffect(() => {
    const settingsJSON = localStorage.getItem("settings");
    const settings = JSON.parse(settingsJSON);
    settings.autoSave = autoSave;
    const newSettingsJSON = JSON.stringify(settings);
    localStorage.setItem("settings", newSettingsJSON);
  }, [autoSave]);
  useEffect(() => {
    Doc2File();
  }, [pdfDoc]);
  const pdfRef = useRef(null);
  const imagesInput = useRef(null);
  const [page, setPage] = useState(1);
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
          pageNumber: i + 1,
        }
      );
    }
    pdf.save("merged.pdf");
  };
  const [pages, setPages] = useState(sketchInfo.pages);
  function handleDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const pagesCopy = [...pages];
    const [reorderedItem] = pagesCopy.splice(result.source.index, 1);
    pagesCopy.splice(result.destination.index, 0, reorderedItem);
    const sketchCopy = sketchInfo;
    sketchCopy.pages = pagesCopy;
    setSketchInfo(sketchCopy);
    setPages(pagesCopy);
  }
  const handleViewPage = (id) => {
    setShowPdf(true);
    setPage(id);
  };
  const handleImagesChange = async (event) => {
    let imagesPdf = await PDFDocument.create();
    let newSketchInfo = sketchInfo;
    let newPdfDoc = pdfDoc;
    let newPdf;
    let numImagesLoaded = 0;
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const reader = new FileReader();
      if (file.type === "image/jpeg" || file.type === "image/png") {
        const blob = await createImageBlob(file);
        let size = await getImageSize(blob);
        const imgCanvas = document.createElement("canvas");
        const width = size.width;
        const height = size.height;
        imgCanvas.width = width;
        imgCanvas.height = height;
        const imgCtx = imgCanvas.getContext("2d");
        newPdf = new jsPDF({
          orientation: size.width > size.height ? "landscape" : "portrait",
          unit: "px",
          format: [size.width, size.height],
        });
        reader.onload = function () {
          const img = new Image();
          img.onload = async function () {
            imgCtx.drawImage(img, 0, 0);
            newPdf.addImage(
              imgCanvas.toDataURL("image/jpeg"),
              "jpeg",
              0,
              0,
              size.width,
              size.height,
              null,
              null,
              null,
              null,
              null,
              null,
              {
                pageNumber: 1,
              }
            );
            const pdfBuffer = newPdf.output("arraybuffer");
            const imgPdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await imagesPdf.copyPages(
              imgPdf,
              imgPdf.getPageIndices()
            );
            copiedPages.forEach((page) => imagesPdf.addPage(page));
            newSketchInfo.pages.push({
              id: newSketchInfo.pages.length,
              page: newSketchInfo.pages.length + 1,
              edited: false,
              preview: false,
              sketches: { shapes: [] },
            });
            newSketchInfo.totalPages = newSketchInfo.totalPages + 1;
            numImagesLoaded++;
            if (numImagesLoaded === event.target.files.length) {
              mergeAndSetPdf();
            }
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }

    const mergeAndSetPdf = async () => {
      let newPages = await newPdfDoc.copyPages(
        imagesPdf,
        imagesPdf.getPageIndices()
      );
      newPages.forEach((page) => newPdfDoc.addPage(page));
      const finalMergeBytes = await newPdfDoc.save();
      const finalPdf = await PDFDocument.load(finalMergeBytes);
      setPdfDoc(finalPdf);
      setSketchInfo(newSketchInfo);
    };
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
        <div className="flex justify-center items-center gap-4">
          <SubHeading>Auto Save Edit</SubHeading>
          <input
            className="w-[16px] h-[16px] cursor-pointer"
            type="checkbox"
            checked={autoSave}
            onChange={() => setAutoSave(!autoSave)}
          />
        </div>
        {/* render pages */}
        <PagesDiv className="flex w-[1000px] h-[400px] relative flex-col justify-start items-start border border-black px-2  rounded-tr-sm rounded-tl-sm">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-full"
                >
                  {sketchInfo.pages.map((el, i) => (
                    <Draggable
                      key={el.page}
                      draggableId={el.id.toString()}
                      index={i}
                    >
                      {(provided) => (
                        <li
                          className="flex justify-between items-start font-medium flex-col w-full gap-1 px-4 py-2 border-b border-black"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex justify-center items-center gap-4">
                              <img
                                src={`/images/eye.png`}
                                width={24}
                                height={24}
                                onClick={() => handleViewPage(el.page)}
                                className="cursor-pointer"
                              />
                              {`Page ${i + 1}`}
                              {`/ original position ${el.page}`}
                            </div>
                            <div className="flex justify-center gap-2 items-center cursor-pointer">
                              <img
                                src={`/images/${
                                  el.edited ? "edited" : "edit"
                                }.png`}
                                width={20}
                                height={20}
                                onClick={() =>
                                  handleSelectPageForDrawing(el.page)
                                }
                              />
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </PagesDiv>
        <div className="w-[1000px] h-[45px] flex justify-between items-center px-4 border-b border-l border-r border-black mb-4 rounded-br-sm rounded-bl-sm">
          <p className="mx-3 font-semibold text-lg">add images as pdf pages</p>
          <div className="relative w-[45px] h-[45px] justify-center items-center flex overflow-hidden cursor-pointer mx-3">
            <div className="w-[45px] opacity-0 h-[45px] justify-center items-center flex absolute top-0 left-0 overflow-hidden cursor-pointer">
              <input
                multiple={true}
                type="file"
                accept="image/png, image/jpeg"
                ref={imagesInput}
                onChange={handleImagesChange}
                className="cursor-pointer"
              />
            </div>
            <img
              src="/images/upload.png"
              alt="back"
              width="32px"
              height="32px"
              className=" ml-4 cursor-pointer"
            />
          </div>
        </div>
        <ContinueBtn className="hover:bg-[#0B7189]" onClick={exportPdfPages}>
          Download Edited
        </ContinueBtn>
      </div>
      <div
        className={`${
          showPdf ? "opacity-1 z-50" : "opacity-0 z-10 "
        } absolute top-0 left-0 w-screen h-screen flex justify-center items-center `}
      >
        <div
          className="absolute top-0 w-screen h-screen bg-gray-600 opacity-40 left-0"
          onClick={() => setShowPdf(false)}
        ></div>
        <Document file={file}>
          <Page
            pageNumber={page}
            canvasRef={pdfRef}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            // onLoadSuccess={() => setLoaded(!loaded)}
          />
        </Document>
      </div>
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
  background: #228cdb;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
  margin-bottom: 10px;
  width: 400px;
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
