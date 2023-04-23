import styled from "styled-components";

const Step0 = ({ setActiveStep }) => {
  return (
    <>
      {/* <Heading>How do you like to upload the Files</Heading> */}
      <button
        onClick={() => setActiveStep(1)}
        className="w-[400px] h-[60px] text-white bg-[#5fee8a] m-4 rounded-md hover:bg-cyan-600"
      >
        Upload Pdfs from computer
      </button>
      {/* <button
        onClick={() => setActiveStep(0.1)}
        className="w-[400px] h-[60px] text-white bg-[#5fee8a] m-4 rounded-md hover:bg-cyan-600"
      >
        Pdf from urls                                                           
      </button> */}
    </>
  );
};

export default Step0;
