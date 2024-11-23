
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { openDB } from 'idb'; // Import idb library
import cloudUploadImage from "../images/cloudUplaod.png"; 

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const UploadCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 500px;
  padding: 40px;
  background-color: #ffffff;
  border: 2px dashed #d3cfe2;
  border-radius: 15px;
  text-align: center;
  transition: border-color 0.3s ease;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  ${(props) => props.isDragging && `border-color: #6c63ff;`}
`;

const UploadIcon = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
`;

const TextContainer = styled.div`
  margin-bottom: 20px;
  cursor: pointer;
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

const HiddenInput = styled.input`
  display: none;
`;

const Title = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6c63ff;
`;

const UploadScreen = () => {
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

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
        if (file && file.type.startsWith("video/")) {
            handleFileUpload(file);
        } else {
            alert("Please upload a video file.");
        }
    };

    const handleFileUpload = async (file) => {
        const db = await openDB('video-store', 1, {
            upgrade(db) {
                db.createObjectStore('videos', { keyPath: 'id' });
            },
        });

        // Store the video file in IndexedDB
        await db.put('videos', { id: 'uploadedVideo', file });

        console.log("File saved to IndexedDB:", file.name);
        navigate("/preview"); // Redirect to the preview screen
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("video/")) {
            handleFileUpload(file);
        } else {
            alert("Please upload a video file.");
        }
    };

    return (
        <AppContainer>
            <UploadCard
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                isDragging={isDragging}
            >
                <UploadIcon src={cloudUploadImage} alt="Upload Icon" />
                <TextContainer
                    onClick={() => document.getElementById("fileUpload").click()}
                >
                    <Title>
                        Drag & Drop a <strong style={{ color: "#6c63ff" }}>Video</strong>{" "}
                        file
                    </Title>
                    <Subtitle>or click to browse your files</Subtitle>
                </TextContainer>
                <HiddenInput
                    type="file"
                    id="fileUpload"
                    accept="video/*"
                    onChange={handleFileChange}
                />
                <UploadButtonStyled
                    onClick={() => document.getElementById("fileUpload").click()}
                >
                    Upload
                </UploadButtonStyled>
            </UploadCard>
        </AppContainer>
    );
};

export default UploadScreen;
