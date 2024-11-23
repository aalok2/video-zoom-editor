import React, { useState } from "react";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #f7f9fc;
`;

const UploadCard = styled.div`
  width: 20000px; /* Increased width for a more horizontal look */
  padding: 20px 40px; /* Reduced padding to make it compact */
  background-color: #ffffff;
  border: 2px dashed #d3cfe2;
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row; /* Horizontal layout */
  align-items: center;
  justify-content: space-between; /* Spacing between elements */
  text-align: left;
`;

const Icon = styled.div`
  font-size: 40px;
  color: #9376e0;
  margin-right: 20px;
`;

const TextContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6c63ff;
  cursor: pointer;
  margin: 5px 0 0 0;
  text-decoration: underline;
`;

const UploadButtonStyled = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #6c63ff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File dropped:", file.name);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  return (
    <AppContainer>
      <UploadCard
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ borderColor: isDragging ? "#6c63ff" : "#d3cfe2" }}
      >
        <Icon>📁</Icon>
        <TextContainer>
          <Title>
            Drag & drop{" "}
            <strong style={{ color: "#6c63ff" }}>Images, videos</strong>, or any
            file
          </Title>
          <Subtitle>or browse files on your computer</Subtitle>
        </TextContainer>
        <input
          type="file"
          id="fileUpload"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label htmlFor="fileUpload">
          <UploadButtonStyled>Upload</UploadButtonStyled>
        </label>
      </UploadCard>
    </AppContainer>
  );
};

export default App;

