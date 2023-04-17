const ToolIcon = ({ tool, drawTool, setDrawTool, disable }) => {
  return (
    <div
      className={`w-[50px] h-[50px] rounded-md flex justify-center items-center hover:bg-slate-100
 ${
   drawTool === tool
     ? "bg-blue-200 cursor-pointer"
     : disable
     ? "bg-red-200 cursor-not-allowed"
     : "bg-white cursor-pointer"
 }`}
      onClick={() => (disable ? "" : setDrawTool(tool))}
    >
      <img width={32} height={32} src={`/images/${tool}.png`} alt={tool} />
    </div>
  );
};

export default ToolIcon;
