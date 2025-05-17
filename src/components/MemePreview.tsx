 
 
import React, { RefObject, useRef, useState, useEffect, useCallback } from "react";
import styled, { css } from "styled-components";
import { addStroke, updateTextPosition } from "../redux";
import { RootState, useAppSelector, useAppDispatch } from "../redux/store";
import ResponsiveText from "./ResponsiveText";
import debounce from "lodash/debounce";

// Component
interface MemePreviewProps {
  memeRef: RefObject<HTMLDivElement>;
}

const MemePreview: React.FC<MemePreviewProps> = ({ memeRef }) => {
  const {
    memeImage,
    topText,
    bottomText,
    bold,
    shadow,
    blur,
    grayscale,
    drawingColor,
    brushSize,
    strokes,
    activeTab,
    topFontSize,
    bottomFontSize,
    topFontFamily,
    bottomFontFamily,
    topTextAlign,
    bottomTextAlign,
    topTextPosition,
    bottomTextPosition,
    useResponsiveFont,
  } = useAppSelector((state: RootState) => state.meme);

  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const imgRef = useRef<HTMLImageElement>(null);

  // For text dragging
  const [draggingText, setDraggingText] = useState<"top" | "bottom" | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);

  // Add local state for smoother dragging
  const [localTopPosition, setLocalTopPosition] = useState({ x: 0, y: 0 });
  const [localBottomPosition, setLocalBottomPosition] = useState({ x: 0, y: 0 });

  // Sync local positions with redux when not dragging
  useEffect(() => {
    if (!draggingText) {
      setLocalTopPosition(topTextPosition);
      setLocalBottomPosition(bottomTextPosition);
    }
  }, [topTextPosition, bottomTextPosition, draggingText]);

  // Debounced dispatch to Redux
  const debouncedUpdatePosition = 
    debounce((position: "top" | "bottom", x: number, y: number) => {
      dispatch(updateTextPosition({ position, x, y }));
    }, 50); // 50ms debounce for Redux updates


  // Check if draw panel is active
  const isDrawPanelActive = activeTab === "draw";
  const isTextDraggable = activeTab === "text";

  // Initialize canvas size when the component mounts or when the image changes
  useEffect(() => {
    updateCanvasSize();
  }, [memeImage]);

  // Redraw all strokes whenever strokes array changes
  useEffect(() => {
    drawAllStrokes();
  }, [strokes]);

  // Handle mouse movement with immediate local updates and debounced Redux updates
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingText || !memeRef.current) return;

      const memeRect = memeRef.current.getBoundingClientRect();
      const textRef = draggingText === "top" ? topTextRef : bottomTextRef;
      
      if (!textRef.current) return;
      
      const textRect = textRef.current.getBoundingClientRect();
      
      // Calculate new position by subtracting the drag offset from mouse position
      const newX = e.clientX - memeRect.left - dragOffset.x;
      const newY = e.clientY - memeRect.top - dragOffset.y;
      
      // Calculate boundaries
      const padding = 5;
      const maxX = memeRect.width - textRect.width + padding;
      const maxY = memeRect.height - textRect.height + padding;
      
      // Constrain the position
      const constrainedX = Math.max(0, Math.min(maxX, newX));
      const constrainedY = Math.max(0, Math.min(maxY, newY));
      
      // Update local state immediately for smooth UI
      if (draggingText === "top") {
        setLocalTopPosition({ x: constrainedX, y: constrainedY });
      } else {
        setLocalBottomPosition({ x: constrainedX, y: constrainedY });
      }
      
      // Update Redux (debounced)
      debouncedUpdatePosition(draggingText, constrainedX, constrainedY);
    },
    [draggingText, memeRef, dragOffset, topTextRef, bottomTextRef, debouncedUpdatePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggingText) return;

    // On release, ensure Redux state is updated with final position
    const position =
      draggingText === "top" ? localTopPosition : localBottomPosition;

    dispatch(
      updateTextPosition({
        position: draggingText,
        x: position.x,
        y: position.y,
      })
    );

    setDraggingText(null);
  }, [draggingText, localTopPosition, localBottomPosition, dispatch]);

  // Event listener cleanup
  useEffect(() => {
    if (!draggingText) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      debouncedUpdatePosition.cancel();
    };
  }, [draggingText, handleMouseMove, handleMouseUp, debouncedUpdatePosition]);

  // Add this useEffect to set initial text positions when image loads
  useEffect(() => {
    if (memeRef.current && memeImage) {
      // Get the dimensions only once when the image loads
      const memeCardRect = memeRef.current.getBoundingClientRect();

      // Set initial position for top text (centered horizontally at the top)
      if (topTextPosition.x === 0 && topTextPosition.y === 0) {
        const initialTopX = Math.max(0, (memeCardRect.width - 300) / 2);
        const initialTopY = 20; // 20px from the top
        
        // Update Redux state AND local state
        dispatch(updateTextPosition({
          position: "top",
          x: initialTopX,
          y: initialTopY
        }));
        
        setLocalTopPosition({ x: initialTopX, y: initialTopY });
        
        // Log for debugging
        console.log("Setting top text initial position:", initialTopX, initialTopY);
      }

      // Set initial position for bottom text (centered horizontally at the bottom)
      if (bottomTextPosition.x === 0 && bottomTextPosition.y === 0) {
        const initialBottomX = Math.max(0, (memeCardRect.width - 300) / 2);
        // Calculate position from top of container, not from center
        const initialBottomY = memeCardRect.height - 80; // 80px from the bottom
        
        // Update Redux state AND local state
        dispatch(updateTextPosition({
          position: "bottom",
          x: initialBottomX,
          y: initialBottomY
        }));
        
        setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
        
        // Log for debugging
        console.log("Setting bottom text initial position:", initialBottomX, initialBottomY);
      }
    }
  }, [memeImage]); // Only depend on memeImage to run once when image loads

  // Function to draw all strokes
  const drawAllStrokes = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved strokes
    strokes.forEach(
      (stroke: {
        path: Array<{ x: number; y: number }>;
        color: string;
        width: number;
      }) => {
        if (stroke.path.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(stroke.path[0].x, stroke.path[0].y);

        for (let i = 1; i < stroke.path.length; i++) {
          ctx.lineTo(stroke.path[i].x, stroke.path[i].y);
        }

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    );
  };

  // Update canvas size based on the displayed image
  const updateCanvasSize = () => {
    if (canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;

      // Get the actual image dimensions instead of the element dimensions
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas and redraw strokes with the new size
      drawAllStrokes();
    }
  };

  // Handle image load to update canvas size
  const handleImageLoad = () => {
    updateCanvasSize();
    
    // Wait for image to fully load and get proper dimensions
    setTimeout(() => {
      if (memeRef.current) {
        const memeCardRect = memeRef.current.getBoundingClientRect();
        
        // Force positioning of both texts
        const initialTopX = Math.max(0, (memeCardRect.width - 300) / 2);
        const initialTopY = 5; // Moved to just 5px from the top (was 10px)
        
        const initialBottomX = Math.max(0, (memeCardRect.width - 300) / 2); 
        const initialBottomY = memeCardRect.height - 50; // 50px from bottom
        
        console.log("Image loaded - forcing text positions:", memeCardRect.width, memeCardRect.height);
        
        // Update positions in Redux
        dispatch(updateTextPosition({
          position: "top",
          x: initialTopX,
          y: initialTopY
        }));
        
        dispatch(updateTextPosition({
          position: "bottom",
          x: initialBottomX,
          y: initialBottomY
        }));
        
        // Update local state
        setLocalTopPosition({ x: initialTopX, y: initialTopY });
        setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
      }
    }, 100); // Small delay to ensure image dimensions are available
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only allow drawing if the Draw Panel is active
    if (!isDrawPanelActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate the exact position within the canvas
    // Using scale factors to account for any CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only allow drawing if the Draw Panel is active
    if (!isDrawPanelActive || !isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Apply the same scaling factors for consistent drawing
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPath((prev) => [...prev, { x, y }]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const finishDrawing = () => {
    // Only save drawing if the Draw Panel is active
    if (isDrawPanelActive && isDrawing && currentPath.length > 0) {
      // Add the stroke to redux store
      dispatch(
        addStroke({
          path: currentPath,
          color: drawingColor,
          width: brushSize,
        })
      );

      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  // Start dragging
  const handleTextMouseDown = (
    e: React.MouseEvent,
    position: "top" | "bottom"
  ) => {
    if (!isTextDraggable) return;

    e.preventDefault();
    e.stopPropagation();

    // Set which text is being dragged
    setDraggingText(position);
    
    // Reference the correct text element and get the current mouse position
    const textElement = position === "top" ? topTextRef.current : bottomTextRef.current;
    
    if (textElement && memeRef.current) {
      const textRect = textElement.getBoundingClientRect();
      
      // Calculate the offset from the mouse cursor to the top-left corner of the text element
      const offsetX = e.clientX - textRect.left;
      const offsetY = e.clientY - textRect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>Meme Preview</PreviewTitle>
      </PreviewHeader>
      <MemeContainer>
        <MemeCard ref={memeRef}>
          {memeImage ? (
            <>
              <MemeImage
                ref={imgRef}
                src={memeImage}
                alt="Meme"
                $blur={blur}
                $grayscale={grayscale}
                onLoad={handleImageLoad}
              />
              <DrawingCanvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                $isDrawPanelActive={activeTab === "draw"}
              />
              {(topText !== undefined && topText !== '') && (
                <MemeTextContainer
                  ref={topTextRef}
                  style={{
                    top: `${draggingText === "top" ? localTopPosition.y : topTextPosition.y}px`,
                    left: `${draggingText === "top" ? localTopPosition.x : topTextPosition.x}px`,
                    cursor: isTextDraggable ? "move" : "default",
                  }}
                  onMouseDown={(e) => handleTextMouseDown(e, "top")}
                  $isDragging={draggingText === "top"}
                  $isEditable={isTextDraggable}
                >
                  {useResponsiveFont ? (
                    <ResponsiveText
                      text={topText}
                      fontSize={topFontSize}
                      containerWidth={memeRef.current?.offsetWidth || 400}
                      bold={bold}
                      shadow={shadow}
                      fontFamily={topFontFamily}
                      textAlign={topTextAlign}
                    />
                  ) : (
                    <MemeText
                      position="top"
                      bold={bold}
                      shadow={shadow}
                      fontSize={topFontSize}
                      fontFamily={topFontFamily}
                      textAlign={topTextAlign}
                    >
                      {topText}
                    </MemeText>
                  )}
                  {isTextDraggable && <DragHandle>⇄</DragHandle>}
                </MemeTextContainer>
              )}
              {(bottomText !== undefined && bottomText !== '') && (
                <MemeTextContainer
                  ref={bottomTextRef}
                  style={{
                    top: `${draggingText === "bottom" ? localBottomPosition.y : bottomTextPosition.y}px`,
                    left: `${draggingText === "bottom" ? localBottomPosition.x : bottomTextPosition.x}px`,
                    cursor: isTextDraggable ? "move" : "default",
                  }}
                  onMouseDown={(e) => handleTextMouseDown(e, "bottom")}
                  $isDragging={draggingText === "bottom"}
                  $isEditable={isTextDraggable}
                >
                  {useResponsiveFont ? (
                    <ResponsiveText
                      text={bottomText}
                      fontSize={bottomFontSize}
                      containerWidth={memeRef.current?.offsetWidth || 400}
                      bold={bold}
                      shadow={shadow}
                      fontFamily={bottomFontFamily}
                      textAlign={bottomTextAlign}
                    />
                  ) : (
                    <MemeText
                      position="bottom"
                      bold={bold}
                      shadow={shadow}
                      fontSize={bottomFontSize}
                      fontFamily={bottomFontFamily}
                      textAlign={bottomTextAlign}
                    >
                      {bottomText}
                    </MemeText>
                  )}
                  {isTextDraggable && <DragHandle>⇄</DragHandle>}
                </MemeTextContainer>
              )}
            </>
          ) : (
            <div
              style={{
                color: "#888",
                fontSize: "1.1rem",
                textAlign: "center",
                width: "100%",
                padding: "0 2rem",
              }}
            >
              Upload an image to create your meme
            </div>
          )}
        </MemeCard>
      </MemeContainer>
    </PreviewContainer>
  );
};

// Styled components
const PreviewContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  flex: 1;

  @media (min-width: 768px) {
    max-width: 55%;
  }
`;

const PreviewHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MemeContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 1.5rem;

  @media (min-width: 768px) {
    min-height: 400px;
  }
`;

const MemeCard = styled.div`
  width: 100%;
  max-width: 450px;
  height: auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  aspect-ratio: auto;
  border: none;
`;

const MemeImage = styled.img<{ $blur: boolean; $grayscale: boolean }>`
  display: block;
  max-width: 450px;
  width: 100%;
  height: 100%;
  object-fit: contain;

  ${({ $blur }) =>
    $blur &&
    css`
      filter: blur(3px);
    `}
  ${({ $grayscale, $blur }) =>
    $grayscale &&
    css`
      filter: ${$blur ? "grayscale(1) blur(3px)" : "grayscale(1)"};
    `}
`;

const MemeTextContainer = styled.div<{
  $isDragging?: boolean;
  $isEditable?: boolean;
}>`
  position: absolute;
  z-index: 20;
  padding: 5px;
  border-radius: 4px;
  user-select: none;
  display: inline-block;

  ${(props) =>
    props.$isDragging &&
    css`
      background: rgba(255, 255, 255, 0.15);
      z-index: 25;
    `}

  ${(props) =>
    props.$isEditable &&
    css`
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `}
`;

const DragHandle = styled.div`
  position: absolute;
  top: -18px;
  right: 5px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 3px;
  padding: 2px 5px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;

  ${MemeTextContainer}:hover & {
    opacity: 1;
  }
`;

const MemeText = styled.div<{
  bold: boolean;
  shadow: boolean;
  position: "top" | "bottom";
  fontSize: number;
  fontFamily: string;
  textAlign: string;
}>`
  text-align: ${(props) => props.textAlign || "center"};
  font-size: ${(props) => props.fontSize / 16}rem;
  font-family: ${(props) => props.fontFamily || "Impact"};
  padding: 0 10px;
  color: #fff;
  ${({ bold }) =>
    bold &&
    css`
      font-weight: bold;
    `}
  ${({ shadow }) =>
    shadow
      ? css`
          text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000,
            2px 2px 0 #000, 0 0 8px rgba(0, 0, 0, 0.7);
        `
      : css`
          text-shadow: none;
        `}
  text-transform: uppercase;
  white-space: pre-line; /* Preserves newlines but collapses whitespace */
  word-break: break-word; /* Allows breaking at any character if needed */
  overflow-wrap: break-word; /* Modern property for word wrapping */
  max-width: 400px; /* Fixed width to control line breaks */
  line-height: 1.2;
  margin: 0;
  padding: 0 5px;
`;

const DrawingCanvas = styled.canvas<{
  $isDrawPanelActive: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${(props) => (props.$isDrawPanelActive ? "auto" : "none")};
  z-index: 10;
`;

export default MemePreview;
