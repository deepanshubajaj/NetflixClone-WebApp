import React, { useEffect, useState, useRef } from "react";
import NetFlixLogoVideo from "../NetflixTransitionVideo/NetFlixLogoVideo.mp4";
import NetflixAudio from "../NetflixAudio/netflixAudio.mp3";
import { ClipLoader } from "react-spinners";

function SplashScreen({ onFinish }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Track user interaction to allow audio playback
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // Preload media
  useEffect(() => {
    const preloadMedia = async () => {
      const videoReady = new Promise((resolve) => {
        const video = videoRef.current;
        if (!video) return resolve();
        if (video.readyState >= 2) return resolve();
        video.onloadeddata = () => resolve();
      });

      const audioReady = new Promise((resolve) => {
        const audio = audioRef.current;
        if (!audio) return resolve();
        if (audio.readyState >= 3) return resolve();
        audio.oncanplaythrough = () => resolve();
      });

      await Promise.all([videoReady, audioReady]);
      setIsLoading(false);
      setShowSplash(true);
    };

    preloadMedia();
  }, []);

  // Play video (muted) + audio (only if user interacted)
  useEffect(() => {
    if (!showSplash) return;

    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.muted = true; // mute video so it autoplays
      video.play().catch((err) => console.warn("Video play failed:", err));
    }

    if (audio && hasUserInteracted) {
      audio.play().catch((err) => console.warn("Audio play failed:", err));
    }

    // End splash after video ends or fallback timeout
    const timeout = setTimeout(() => {
      audio?.pause();
      onFinish();
    }, 5000);

    video.onended = () => {
      audio?.pause();
      onFinish();
    };

    return () => clearTimeout(timeout);
  }, [showSplash, hasUserInteracted, onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {isLoading && <ClipLoader color="#FF0000" size={160} />}
      {!isLoading && showSplash && (
        <>
          <audio ref={audioRef} src={NetflixAudio} preload="auto" />
          <video
            ref={videoRef}
            src={NetFlixLogoVideo}
            className="w-full h-full object-cover"
            playsInline
          />
        </>
      )}
    </div>
  );
}

export default SplashScreen;
