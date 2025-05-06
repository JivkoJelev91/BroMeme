import React from 'react';
import styled from 'styled-components';
import { 
  useAppSelector, 
  useAppDispatch, 
  rotateImageClockwise,
  rotateImageCounterClockwise,
  setImageRotationAngle
} from '../../redux';
import { RootState } from '../../redux/store';

const RotatePanel: React.FC = () => {
  const { imageRotationAngle } = useAppSelector((state: RootState) => state.meme);
  const dispatch = useAppDispatch();

  const handleRotateImageLeft = () => {
    dispatch(rotateImageCounterClockwise());
  };

  const handleRotateImageRight = () => {
    dispatch(rotateImageClockwise());
  };

  const handleResetImageRotation = () => {
    dispatch(setImageRotationAngle(0));
  };

  return (
    <RotatePanelContainer>
      <RotationSection>
        <SectionTitle>Image Rotation</SectionTitle>
        <RotateButtonRow>
          <RotateButton onClick={handleRotateImageLeft} title="Rotate image 90° counter-clockwise">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>
            </svg>
          </RotateButton>
          <RotateAngleDisplay>{imageRotationAngle}°</RotateAngleDisplay>
          <RotateButton onClick={handleRotateImageRight} title="Rotate image 90° clockwise">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/>
            </svg>
          </RotateButton>
        </RotateButtonRow>

        <ResetButton onClick={handleResetImageRotation}>
          Reset Rotation
        </ResetButton>
      </RotationSection>
    </RotatePanelContainer>
  );
};

// Styled components
const RotatePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RotationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const RotateButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const RotateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #f0f2f5;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e4e6e9;
  }

  svg {
    fill: #555;
  }
`;

const RotateAngleDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
`;

const ResetButton = styled.button`
   padding: 8px 16px;
  background-color: ${props => props.disabled ? '#f0f0f0' : '#f0f2f5'};
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  color: #666;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f0f0f0' : '#e4e6e9'};
  }
`;

export default RotatePanel;