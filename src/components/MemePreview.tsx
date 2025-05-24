import React, { RefObject, useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
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
  } = useAppSelector((state: RootState) => state.meme);

  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const [memeContainerWidth, setMemeContainerWidth] = useState<number>(450); // Store exact container width

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

    // Function to draw all strokes - using useCallback to prevent unnecessary rerenders
  const drawAllStrokes = useCallback(() => {
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
  }, [strokes]);

  // Update canvas size based on the displayed image - using useCallback for optimization
  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;

      // Get the actual image dimensions instead of the element dimensions
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Update the meme container width for text scaling
      setMemeContainerWidth(rect.width);

      // Clear canvas and redraw strokes with the new size
      drawAllStrokes();
    }
  }, [drawAllStrokes, setMemeContainerWidth]);
  // Initialize canvas size when the component mounts or when the image changes
  useEffect(() => {
    updateCanvasSize();
  }, [memeImage, updateCanvasSize]);
  // Redraw all strokes whenever strokes array changes
  useEffect(() => {
    drawAllStrokes();
  }, [strokes, drawAllStrokes]);
  // Handle mouse movement with immediate local updates and debounced Redux updates
  // Accounts for the transform: translateX(-50%) in the MemeTextContainer
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingText || !memeRef.current) return;
      const memeRect = memeRef.current.getBoundingClientRect();
      const textRef = draggingText === "top" ? topTextRef : bottomTextRef;
      if (!textRef.current) return;
      const mouseX = e.clientX - memeRect.left;
      const mouseY = e.clientY - memeRect.top;
      // Center X: add half text width to keep center under cursor
      const newX = mouseX - dragOffset.x + textRef.current.offsetWidth / 2;
      const newY = mouseY - dragOffset.y;
      
      // Calculate boundaries with less restrictive constraints
      const padding = 2; // Further reduced padding to allow text closer to edges
      
      // Get text width for more accurate boundary calculation
      const textWidth = textRef.current.offsetWidth;
      const textHeight = textRef.current.offsetHeight;
      
      // Minimum positions - keep text within bounds
      const minX = Math.max(textWidth / 2, padding); // Don't let text go off left edge
      const minY = padding;
      // Maximum positions - keep text top position within the viable area
      const maxX = memeRect.width - textWidth / 2; // Don't let text go off right edge
      // Remove '- 20' so text can go all the way to the bottom
      const maxY = memeRect.height - textHeight - padding;
      // For X, constrain text center position within the viable area
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      // For Y, constrain text top position within the viable area
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
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

  // Replace the useEffect that sets initial positions with useLayoutEffect for correct timing
  useLayoutEffect(() => {
    if (
      memeRef.current &&
      memeImage &&
      ((topTextPosition.x === 0 && topTextPosition.y === 0) ||
        (bottomTextPosition.x === 0 && bottomTextPosition.y === 0))
    ) {
      const memeCardRect = memeRef.current.getBoundingClientRect();
      setMemeContainerWidth(memeCardRect.width);
      if (topTextPosition.x === 0 && topTextPosition.y === 0) {
        const initialTopX = memeCardRect.width / 2;
        const initialTopY = 2;
        dispatch(
          updateTextPosition({
            position: "top",
            x: initialTopX,
            y: initialTopY,
          })
        );
        setLocalTopPosition({ x: initialTopX, y: initialTopY });
      }
      if (bottomTextPosition.x === 0 && bottomTextPosition.y === 0) {
        const initialBottomX = memeCardRect.width / 2;
        let bottomTextHeight = 0;
        if (bottomTextRef.current) {
          bottomTextHeight = bottomTextRef.current.offsetHeight;
        }
        const initialBottomY = memeCardRect.height - bottomTextHeight - 2;
        dispatch(
          updateTextPosition({
            position: "bottom",
            x: initialBottomX,
            y: initialBottomY,
          })
        );
        setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
      }
    }
  }, [memeImage, topTextPosition.x, topTextPosition.y, bottomTextPosition.x, bottomTextPosition.y, memeRef, dispatch, setLocalTopPosition, setLocalBottomPosition]);

  const handleImageLoad = () => {
    updateCanvasSize();
    setTimeout(() => {
      if (memeRef.current) {
        const memeCardRect = memeRef.current.getBoundingClientRect();
        setMemeContainerWidth(memeCardRect.width);
        const initialTopX = memeCardRect.width / 2;
        const initialTopY = 2;
        const initialBottomX = memeCardRect.width / 2;
        let bottomTextHeight = 0;
        if (bottomTextRef.current) {
          bottomTextHeight = bottomTextRef.current.offsetHeight;
        }
        // Set initial Y for bottom text near the bottom using 'top' coordinate
        const initialBottomY = memeCardRect.height - bottomTextHeight - 2;
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
        setLocalTopPosition({ x: initialTopX, y: initialTopY });
        setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
      }
    }, 100);
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
  // Start dragging - updated to handle centered text with transform: translateX(-50%)
  const handleTextMouseDown = (
    e: React.MouseEvent,
    position: "top" | "bottom"
  ) => {
    if (!isTextDraggable) return;

    e.preventDefault();
    e.stopPropagation();

    // Set which text is being dragged
    setDraggingText(position);
    
    const textElement = position === "top" ? topTextRef.current : bottomTextRef.current;
    if (textElement && memeRef.current) {
      const textRect = textElement.getBoundingClientRect();
      const offsetX = e.clientX - textRect.left;
      let offsetY = e.clientY - textRect.top;
      // Clamp offsetY for bottom text if it's at the bottom boundary
      if (position === "bottom" && memeRef.current) {
        const memeRect = memeRef.current.getBoundingClientRect();
        const maxY = memeRect.height - textElement.offsetHeight - 2;
        // If the text is at the bottom, force offsetY to 0 (so it doesn't jump)
        if (Math.abs(textRect.top - (memeRect.top + maxY)) < 2) {
          offsetY = 0;
        }
      }
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  // Place this after all hooks, before return (
  useEffect(() => {
    if (
      bottomText &&
      memeRef.current &&
      bottomTextRef.current &&
      (bottomTextPosition.y === 0 || bottomTextPosition.y < 20)
    ) {
      const memeCardRect = memeRef.current.getBoundingClientRect();
      const bottomTextHeight = bottomTextRef.current.offsetHeight;
      const initialBottomX = memeCardRect.width / 2;
      const initialBottomY = memeCardRect.height - bottomTextHeight - 2;
      dispatch(
        updateTextPosition({
          position: "bottom",
          x: initialBottomX,
          y: initialBottomY,
        })
      );
      setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
    }
  }, [bottomText, memeRef, bottomTextRef, bottomTextPosition.y, dispatch]);

  // Robustly set bottom text position after image/text render or text height change
  useLayoutEffect(() => {
    if (
      bottomText &&
      memeRef.current &&
      bottomTextRef.current &&
      bottomTextRef.current.offsetHeight > 0 &&
      memeImage
    ) {
      const memeCardRect = memeRef.current.getBoundingClientRect();
      const bottomTextHeight = bottomTextRef.current.offsetHeight;
      const initialBottomX = memeCardRect.width / 2;
      const initialBottomY = memeCardRect.height - bottomTextHeight - 2;
      // Always set the position if the text height or text changes
      if (
        Math.abs((bottomTextPosition.y + bottomTextHeight + 2) - memeCardRect.height) > 2
      ) {
        dispatch(
          updateTextPosition({
            position: "bottom",
            x: initialBottomX,
            y: initialBottomY,
          })
        );
        setLocalBottomPosition({ x: initialBottomX, y: initialBottomY });
      }
    }
  }, [bottomText, memeImage, memeRef, bottomTextRef, bottomTextPosition.y, bottomTextPosition.x, dispatch]);

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
              />              {(topText !== undefined && topText !== '') && (
                <MemeTextContainer
                  ref={topTextRef}
                  style={{
                    top: `${draggingText === "top" ? localTopPosition.y : topTextPosition.y}px`,
                    left: `${(draggingText === "top" ? localTopPosition.x : topTextPosition.x) - (topTextRef.current?.offsetWidth || 0) / 2}px`,
                    cursor: isTextDraggable ? "move" : "default"
                  }}
                  onMouseDown={(e) => handleTextMouseDown(e, "top")}
                  $isDragging={draggingText === "top"}
                  $isEditable={isTextDraggable}
                >
                  <ResponsiveText
                    text={topText}
                    fontSize={topFontSize}
                    containerWidth={memeContainerWidth}
                    bold={bold}
                    shadow={shadow}
                    fontFamily={topFontFamily}
                    textAlign={topTextAlign}
                  />
                  {isTextDraggable && <DragHandle>⇄</DragHandle>}
                </MemeTextContainer>
              )}              {(bottomText !== undefined && bottomText !== '') && (
                <MemeTextContainer
                  ref={bottomTextRef}
                  style={{
                    top: `${draggingText === "bottom" ? localBottomPosition.y : bottomTextPosition.y}px`,
                    left: `${(draggingText === "bottom" ? localBottomPosition.x : bottomTextPosition.x) - (bottomTextRef.current?.offsetWidth || 0) / 2}px`,
                    cursor: isTextDraggable ? "move" : "default"
                  }}
                  onMouseDown={(e) => handleTextMouseDown(e, "bottom")}
                  $isDragging={draggingText === "bottom"}
                  $isEditable={isTextDraggable}
                >
                  <ResponsiveText
                    text={bottomText}
                    fontSize={bottomFontSize}
                    containerWidth={memeContainerWidth}
                    bold={bold}
                    shadow={shadow}
                    fontFamily={bottomFontFamily}
                    textAlign={bottomTextAlign}
                  />
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
  box-sizing: border-box;
  padding: 0; /* Remove any padding that might reduce inner space */
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
  padding: 0;
  border-radius: 0;
  user-select: none;
  display: block;
  /* width: 100%; removed for correct positioning */
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;

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
