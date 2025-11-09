'use client';

import { useEffect, useRef, useState } from 'react';

const videos = [
  '/homevideo.mp4',
  '/homevideo2.mp4',
  '/homevideo3.mp4',
  '/homevideo4.mp4',
];

export function VideoBackground() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [nextVideoReady, setNextVideoReady] = useState(false);

  // Initial load - first video
  useEffect(() => {
    const video = video1Ref.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      // Force play on mobile
      video.play().catch(() => {
        // If autoplay fails, that's ok
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    
    // Force play on load for mobile
    setTimeout(() => {
      video.play().catch(() => {});
    }, 100);

    return () => video.removeEventListener('canplay', handleCanPlay);
  }, []);

  // Preload next video when current video is playing
  useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    const nextVideoRef = activeVideo === 1 ? video2Ref.current : video1Ref.current;
    
    if (!nextVideoRef) return;

    const handleCanPlay = () => {
      setNextVideoReady(true);
    };

    // Set up the next video
    nextVideoRef.src = videos[nextIndex];
    nextVideoRef.load();
    
    nextVideoRef.addEventListener('canplaythrough', handleCanPlay);
    
    return () => {
      nextVideoRef.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, [currentVideoIndex, activeVideo]);

  const handleVideoEnd = () => {
    // Only transition if next video is ready
    if (!nextVideoReady) return;
    
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    setNextVideoReady(false);
    
    // Switch active video for cross-fade
    setActiveVideo(prev => prev === 1 ? 2 : 1);
    
    // Play the next video
    const nextVideoRef = activeVideo === 1 ? video2Ref.current : video1Ref.current;
    if (nextVideoRef) {
      nextVideoRef.play().catch(error => {
        console.error('Error playing next video:', error);
      });
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Video 1 */}
      <video
        ref={video1Ref}
        src={videos[0]}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-play-button]:hidden ${
          activeVideo === 1 ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        webkit-playsinline="true"
        x5-playsinline="true"
        onEnded={handleVideoEnd}
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      />

      {/* Video 2 */}
      <video
        ref={video2Ref}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-play-button]:hidden ${
          activeVideo === 2 ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
        }`}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        webkit-playsinline="true"
        x5-playsinline="true"
        onEnded={handleVideoEnd}
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      />

      {/* Overlay για καλύτερη αναγνωσιμότητα του text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/35 z-[2] pointer-events-none" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink/20 via-baby-blue/20 to-lavender/20 animate-pulse z-[3] pointer-events-none" />
      )}
    </div>
  );
}

