import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ZoomPinch = ({children}) => {
  return (
    			<TransformWrapper
              initialScale={1}
              initialPositionX={200}
              initialPositionY={100}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        
                  <TransformComponent>
                    <img src="/public/images/nature.jpeg" alt="test" className="w-[1000px] g-[" />

                  </TransformComponent>
              )}
            </TransformWrapper>
  );
};
export default ZoomPinch