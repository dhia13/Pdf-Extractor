import { useState } from "react";
import styled from "styled-components";

const Step01 = ({ setActiveStep, setLinks, links }) => {
  const [link, setLink] = useState("");
  const handleAddLink = () => {
    const newLinks = links;
    newLinks.push(link);
    setLinks(newLinks);
    setLink("");
  };
  return (
    <>
      <Heading>Insert one Link or Multiple</Heading>
      {links && links.map((link) => <p key={link}>{link}</p>)}
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="link"
        className="w-[400px] p-2 my-4 border border-[#5fee8a]"
      />
      <button
        onClick={() => handleAddLink()}
        className="w-[400px] h-[60px] text-white bg-[#5fee8a] m-4 rounded-md hover:bg-cyan-600"
      >
        Add Link
      </button>
      <button
        onClick={() => setActiveStep(0.2)}
        className="w-[400px] h-[60px] text-white bg-[#5fee8a] m-4 rounded-md hover:bg-cyan-600"
      >
        Edit Pdfs
      </button>
    </>
  );
};

export default Step01;
const Heading = styled.h1`
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 40px;
  color: #000000;
  text-align: "center";
`;
