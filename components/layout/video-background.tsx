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
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [nextVideoReady, setNextVideoReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Aggressive play strategy for iOS 12+
  const attemptPlay = (video: HTMLVideoElement, retries = 5) => {
    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          console.log('✅ Video playing successfully');
        })
        .catch((error) => {
          console.log(`⚠️ Play attempt ${attempt} failed:`, error.message);
          if (attempt < retries) {
            setTimeout(() => tryPlay(attempt + 1), 300 * attempt);
          }
        });
    };
    tryPlay(1);
  };

  // Initial load - first video
  useEffect(() => {
    const video = video1Ref.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      attemptPlay(video);
    };

    const handleLoadedMetadata = () => {
      attemptPlay(video);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Multiple aggressive attempts for newer iOS
    setTimeout(() => attemptPlay(video), 100);
    setTimeout(() => attemptPlay(video), 500);
    setTimeout(() => attemptPlay(video), 1000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Intersection Observer - play when visible (for iOS 12+)
  useEffect(() => {
    const video = video1Ref.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay(video);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // User interaction fallback for strict autoplay policies
  useEffect(() => {
    const handleUserInteraction = () => {
      if (hasInteracted) return;
      setHasInteracted(true);
      
      const video = activeVideo === 1 ? video1Ref.current : video2Ref.current;
      if (video && video.paused) {
        attemptPlay(video);
      }
    };

    // Listen for any user interaction
    const events = ['touchstart', 'click', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [activeVideo, hasInteracted]);

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
    
    // Play the next video with aggressive retry
    const nextVideoRef = activeVideo === 1 ? video2Ref.current : video1Ref.current;
    if (nextVideoRef) {
      attemptPlay(nextVideoRef);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">
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
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
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
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
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

