import styled from "styled-components";

const Step3 = ({ setActiveStep, pdfDoc }) => {
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
  return (
    <>
      <div className="flex justify-center items-center gap-4 mb-20">
        <img
          src="/images/back.png"
          alt="back"
          width="32px"
          height="32px"
          onClick={() => setActiveStep(0)}
          className="cursor-pointer"
        />
        <Heading>Let’s go! Download your new Pdf File</Heading>
      </div>
      <ContinueBtn
        onClick={() => {
          handleDownload();
        }}
      >
        Download File
      </ContinueBtn>
    </>
  );
};

export default Step3;
const Heading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 25px;
  line-height: 40px;
`;
const ContinueBtn = styled.button`
  background: #5fee8a;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
`;
