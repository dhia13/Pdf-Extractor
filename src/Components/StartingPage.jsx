import styled from "styled-components";
// step 0
export default function StartingPage({ setActiveStep }) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      {/* <Heading>How do you like to upload the Files</Heading> */}
      <button
        onClick={() => setActiveStep(1)}
        className="w-[400px] h-[60px] text-white bg-[#228CDB] m-4 rounded-md hover:bg-[#0B7189]"
      >
        Upload Pdfs from computer
      </button>
      {/* <button
        onClick={() => setActiveStep(0.1)}
        className="w-[400px] h-[60px] text-white bg-[#5fee8a] m-4 rounded-md hover:bg-cyan-600"
      >
        Pdf from urls                                                           
      </button> */}
    </div>
  );
}
