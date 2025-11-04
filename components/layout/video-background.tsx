'use client';

import { useEffect, useRef, useState } from 'react';

const videos = [
  '/homevideo.mp4',
  '/homevideo2.mp4',
  '/homevideo3.mp4',
  '/homevideo4.mp4',
];

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [currentVideoIndex]);

  const handleVideoEnd = () => {
    // Μετάβαση στο επόμενο video
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        key={currentVideoIndex}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Overlay για καλύτερη αναγνωσιμότητα του text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink/20 via-baby-blue/20 to-lavender/20 animate-pulse" />
      )}
    </div>
  );
}

