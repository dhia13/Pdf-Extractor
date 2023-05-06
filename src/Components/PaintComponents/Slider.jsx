import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";
import Image from "next/image";

export default function InputSlider({ title, value, setValue, show, setShow }) {
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };
  const handleOpen = () => {
    setShow(true);
  };
  return (
    <Box className="relative h-[32px]">
      <div className="justify-center items-center flex gap-2 ">
        <p className="text-base font-semibold">{title}</p>
        <div>
          <input
            className="w-[46px] h-[26px] rounded-md pl-2 text-black border border-black"
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 5,
              min: 0,
              max: 100,
              type: "number",
            }}
          />
        </div>
        <div className="cursor-pointer hover:text-gray-400">
          <Image
            width={32}
            height={32}
            src={`/images/down.svg`}
            alt="arrow"
            onClick={handleOpen}
            className="cursor-pointer"
          />
        </div>
      </div>
      {show && (
        <Slider
          value={typeof value === "number" ? value : 0}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
          className="absolute top-[10px] left-1 w-full z-50"
        />
      )}
    </Box>
  );
}
