const ToolIcon = ({ tool, drawTool, setDrawTool, disable }) => {
  return (
    <div
      className={`w-[50px] h-[50px] rounded-md flex justify-center items-center hover:bg-slate-300 shadow-md
 ${
   drawTool === tool
     ? "bg-blue-200 cursor-pointer hover:bg-blue-300"
     : disable
     ? "bg-red-200 cursor-not-allowed"
     : "bg-white cursor-pointer"
 }`}
      onClick={() => (disable ? "" : setDrawTool(tool))}
      title={tool} // added title attribute to display tooltip
    >
      <img width={32} height={32} src={`/images/${tool}.png`} alt={tool} />
    </div>
  );
};

export default ToolIcon;
