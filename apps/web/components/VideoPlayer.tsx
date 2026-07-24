"use client";

import React, { useState, useRef } from "react";
import { AudioMutedIcon, AudioUnmutedIcon, FullscreenIcon } from "@/components/ui/icons";

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export default function VideoPlayer({ src, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!videoRef.current.muted);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        className={`w-full h-full object-cover rounded-sm ${className}`}
        src={src}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Video Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-3">
        <button
          onClick={toggleMute}
          className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <AudioMutedIcon /> : <AudioUnmutedIcon />}
        </button>

        <button
          onClick={toggleFullScreen}
          className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
          aria-label="View in full screen"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}
