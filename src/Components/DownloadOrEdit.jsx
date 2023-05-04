import styled from "styled-components";
// step 4
export default function DownloadOrEdit({
  setActiveStep,
  pdfDoc,
  setPdfDocs,
  setFileNames,
  setSketchInfo,
}) {
  const handleDownload = async () => {
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
  const handleDraw = () => {
    let pages = new Array(pdfDoc.pageCount);
    pages.fill({
      id: 0,
      page: 0,
      edited: false,
      sketches: { shapes: [] },
    });
    pages = pages.map((page, index) => {
      return {
        id: index,
        page: index + 1,
        edited: page.edited,
        sketches: page.sketches,
        preview: false,
      };
    });
    setSketchInfo({
      pdfFile: pdfDoc,
      edited: false,
      selectedPage: 0,
      totalPages: pdfDoc.pageCount,
      pages: pages,
    });
    setActiveStep(4);
  };
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <div className="flex justify-center items-center gap-4 mb-20">
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
        <Heading>Let’s go! Download your new Pdf File</Heading>
      </div>
      <div className="flex flex-col gap-6">
        <ContinueBtn
          className="hover:bg-[#0B7189]"
          onClick={() => {
            handleDownload();
          }}
        >
          Download File
        </ContinueBtn>
        <ContinueBtn
          className="hover:bg-[#0B7189]"
          onClick={() => {
            handleDraw();
          }}
        >
          Reorder pages and draw on them
        </ContinueBtn>
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
const ContinueBtn = styled.button`
  background: #228cdb;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
`;