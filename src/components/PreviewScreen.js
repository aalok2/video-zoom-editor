import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { openDB } from "idb";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Draggable from "react-draggable";
import { IconButton } from "@mui/material"; // Import IconButton from MUI
import PlayArrowIcon from "@mui/icons-material/PlayArrow"; // Play icon
import PauseIcon from "@mui/icons-material/Pause"; // Pause icon
import downarrow from "../images/downarrow.png";
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

const TrimButton = styled.button`
  background-color: #6c63ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
`;

const PlayPauseButtonContainer = styled.div`
  position: absolute;
  margin-top: 20px;
  padding: 10px;
`;

const PreviewScreen = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Track play/pause state
  const videoRef = useRef(null);
  const playerRef = useRef(null);

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
    if (videoUrl && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        width: 640,
        height: 360,
      });
      playerRef.current.on("loadedmetadata", () => {
        setDuration(playerRef.current.duration());
      });
      playerRef.current.on("timeupdate", () => {
        setCurrentTime(playerRef.current.currentTime());
      });
    }
  }, [videoUrl]);

  const handleProcessVideo = async () => {
    if (!videoUrl) return;

    setLoading(true);

    const ffmpeg = new FFmpeg();
    try {
      await ffmpeg.load();
      console.log("FFmpeg loaded!");

      const response = await fetch(videoUrl);
      const videoBuffer = await response.arrayBuffer();
      ffmpeg.FS("writeFile", "input.mp4", new Uint8Array(videoBuffer));

      const startTime = 0;
      const endTime = 10;
      await ffmpeg.run(
        "-i",
        "input.mp4",
        "-ss",
        startTime.toString(),
        "-t",
        endTime.toString(),
        "output.mp4"
      );

      const output = ffmpeg.FS("readFile", "output.mp4");
      const outputBlob = new Blob([output.buffer], { type: "video/mp4" });
      const outputUrl = URL.createObjectURL(outputBlob);

      setVideoUrl(outputUrl);
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e, data) => {
    const newTime = (data.x / 700) * duration;
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.currentTime(newTime);
    }
  };
  const handleTimelineClick = (e) => {
    // Calculate the time based on where the user clicked
    const timelineWidth = e.currentTarget.offsetWidth;
    const clickPosition =
      e.clientX - e.currentTarget.getBoundingClientRect().left;
    const newTime = (clickPosition / timelineWidth) * duration;

    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.currentTime(newTime);
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying); // Toggle play/pause state
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

        <TimelineContainer onClick={handleTimelineClick}>
          <StartTime>0s</StartTime>
          <EndTime>{Math.floor(duration)}s</EndTime>

          <Draggable
            axis="x"
            bounds="parent"
            position={{ x: (currentTime / duration) * 700, y: 0 }}
            onDrag={handleDrag}
          >
            <Pointer>
              {Math.floor(currentTime) > 0 &&
              Math.floor(currentTime) < duration ? (
                <TimeDisplay>{Math.floor(currentTime)}s</TimeDisplay>
              ) : null}
            </Pointer>
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
