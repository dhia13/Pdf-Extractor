import styled from "styled-components";
import React, { useEffect, useState } from "react";
const Step2 = ({ sketchInfo, handleSelectPageForDrawing }) => {
  console.log({ sketchInfo });
  //   const [err, setErr] = useState(false);
  return (
    <>
      <Heading>
        Select which page(s) from your pdf that you want for this specific line
        item
      </Heading>
      <SubHeading>
        Select the page(s) you need and click next, to go back or add more click
        the plus button
      </SubHeading>
      {/* render pages */}
      <PagesDiv className="flex w-full h-[400px] relative flex-col justify-start items-start">
        {sketchInfo.pages.map((el, i) => (
          <li
            className="flex justify-between items-start font-medium flex-col w-full gap-1"
            key={i}
          >
            <div className="w-full flex justify-between items-center">
              {`page ${i}`}
              <div className="flex justify-center gap-2 items-center border border-red-200">
                <img
                  src="/images/edit.png"
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
      <ContinueBtn>Extract</ContinueBtn>
      {/* {err && (
        <SubHeading style={{ color: "red" }}>
          Please select pages you would like to extract
        </SubHeading>
      )} */}
    </>
  );
};
export default Step2;

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
  background: #5fee8a;
  border: 1px solid #2994ff;
  padding: 8px 120px;
  border-radius: 5px;
  color: white;
  float: left;
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
  width: 100%;

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
