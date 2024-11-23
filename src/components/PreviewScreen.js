import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { openDB } from "idb";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Draggable from "react-draggable";
import { IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const VideoContainer = styled.div`
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  height: 500px;
`;

const TimelineContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 20px;
  background-color: #e0e0e0;
  border-radius: 5px;
`;

const Pointer = styled.div`
  position: absolute;
  height: 140%;
  width: 3px;
  background-color: #6c63ff;
  cursor: pointer;
`;

const TimeDisplay = styled.div`
  position: absolute;
  bottom: -20px;
  color: #333;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  width: 40px;
`;

const StartTime = styled.div`
  position: absolute;
  left: 0;
  bottom: -20px;
  color: #333;
  font-size: 12px;
  font-weight: bold;
`;

const EndTime = styled.div`
  position: absolute;
  right: 0;
  bottom: -20px;
  color: #333;
  font-size: 12px;
  font-weight: bold;
`;

const PlayPauseButtonContainer = styled.div`
  position: absolute;
  margin-top: 20px;
  padding: 10px;
`;
const SelectedArea = styled.div`
  position: absolute;
  height: 100%;
  background-color: rgba(108, 99, 255, 0.4); // Semi-transparent background for selected area
  pointer-events: none;
`;

const PreviewScreen = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0); // Left pointer time
  const [endTime, setEndTime] = useState(100); // Right pointer time
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const endTimeRef = useRef(endTime);

useEffect(() => {
  endTimeRef.current = endTime;
}, [endTime]);

  useEffect(() => {
    const fetchVideo = async () => {
      const db = await openDB("video-store", 1);
      const videoData = await db.get("videos", "uploadedVideo");

      if (videoData) {
        const url = URL.createObjectURL(videoData.file);
        setVideoUrl(url);
      } else {
        alert("No video uploaded.");
      }
    };

    fetchVideo();
  }, []);

useEffect(() => {

  // Update the ref whenever endTime change
  if (videoUrl && !playerRef.current) {
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      width: 640,
      height: 360,
    });
    
    playerRef.current.on("loadedmetadata", () => {
         console.log("starttime" , endTime)
      setDuration(playerRef.current.duration());
      // console.log("345" , endTime)
      setEndTime(playerRef.current.duration()); // Initialize end time
      //  console.log("346" , endTime)
    });
    console.log("main end time" , playerRef)
    // playerRef.current.on("timeupdate", () => {
    //   console.log("endtime" , endTimeRef)
    //   if(currentTime <= endTimeRef) {
    //   setCurrentTime(playerRef.current.currentTime());
    //   }

    // });
    playerRef.current.on("timeupdate", () => {
      const current = playerRef.current.currentTime();

      // Use the latest value of endTime
      if (current >= endTimeRef.current - 0.1) {
        playerRef.current.pause();
        setIsPlaying(false);
        setCurrentTime(endTimeRef.current);
      } else {
        setCurrentTime(current);
      }
    });
  }
}, [videoUrl]);

// const handleDragLeft = (e, data) => {
//   const newTime = Math.min((data.x / 700) * duration, endTime); // Prevent crossing the right pointer
//   setCurrentTime(newTime);

//   console.log(playerRef.current);

//   if (playerRef.current && newTime < endTime) {
//     console.log('HIIIIIIIIII');
//     playerRef.current.currentTime(newTime);
//     console.log('react', playerRef.current.currentTime());
//   }

//   // Check if the pointers meet (within a small threshold)
//   if (newTime >= endTime - 0.1) {
//     setIsPlaying(false);
//     playerRef.current.pause();
//   }
// };

// const handleDragRight = (e, data) => {
//   const newEndTime = Math.max((data.x / 700) * duration, currentTime); // Prevent crossing the left pointer
//   setEndTime(newEndTime);

//   // Check if the pointers meet (within a small threshold)
//   if (newEndTime <= currentTime + 0.1) {
//     setIsPlaying(false);
//     playerRef.current.pause();
//   }
// };

const handleDragLeft = (e, data) => {
  const newTime = Math.min((data.x / 700) * duration, endTime - 0.1); // Left pointer can't cross the right pointer
  if(newTime < endTime) 
  {
  setCurrentTime(newTime);
  }
  
  if (playerRef.current) {
    playerRef.current.currentTime(newTime);
  }
};

const handleDragRight = (e, data) => {
  const newEndTime = Math.max((data.x / 700) * duration, currentTime + 0.1); // Right pointer can't cross the left pointer
  setEndTime(Math.floor(newEndTime));
};
  const togglePlayPause = () => {
    if (playerRef.current) {
  if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

return (
  <Container>
    <Title>Video Editor</Title>
    <VideoContainer>
      {videoUrl ? (
        <video ref={videoRef} className="video-js vjs-default-skin" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading video...</p>
      )}

      <TimelineContainer>
        <StartTime>0s</StartTime>
        <EndTime>{endTime}s</EndTime>

        <SelectedArea
          style={{
            left: `${(currentTime / duration) * 100}%`,
            width: `${((endTime - currentTime) / duration) * 100}%`,
          }}
        />

        {/* Left Pointer */}
        <Draggable
          axis="x"
          bounds={{ left: 0, right: (endTime / duration) * 700 }} // Left pointer can only go up to right pointer position
          position={{ x: (currentTime / duration) * 700, y: 0 }}
          onDrag={handleDragLeft}
        >
          <Pointer>
            <TimeDisplay>{Math.floor(currentTime)}s</TimeDisplay>
          </Pointer>
        </Draggable>

        {/* Right Pointer */}
        <Draggable
          axis="x"
          bounds={{ left: (currentTime / duration) * 700, right: 700 }} // Right pointer can only go back to left pointer position
          position={{ x: (endTime / duration) * 700, y: 0 }}
          onDrag={handleDragRight}
        >
     
        </Draggable>
      </TimelineContainer>

      <PlayPauseButtonContainer>
        <IconButton
          onClick={togglePlayPause}
          style={{ backgroundColor: "#6c63ff", color: "white" }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </PlayPauseButtonContainer>
    </VideoContainer>
  </Container>
);
};

export default PreviewScreen;

