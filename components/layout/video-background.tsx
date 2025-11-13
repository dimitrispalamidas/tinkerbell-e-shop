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
  const [isPlaying, setIsPlaying] = useState(false);

  // Aggressive play strategy for iOS 12+
  const attemptPlay = (video: HTMLVideoElement, retries = 10) => {
    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          if (attempt < retries) {
            setTimeout(() => tryPlay(attempt + 1), 200 * attempt);
          }
        });
    };
    tryPlay(1);
  };

  // Handle manual play from overlay tap
  const handlePlayClick = () => {
    const video = activeVideo === 1 ? video1Ref.current : video2Ref.current;
    if (video) {
      setHasInteracted(true);
      attemptPlay(video);
    }
  };

  // Initial load - first video
  useEffect(() => {
    const video = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video) return;

    // Force muted state and load (critical for iOS autoplay)
    video.muted = true;
    video.defaultMuted = true;
    
    // Force load the video
    video.load();

    const handleCanPlay = () => {
      setIsLoading(false);
      attemptPlay(video);
    };

    const handleLoadedData = () => {
      attemptPlay(video);
    };

    const handleLoadedMetadata = () => {
      attemptPlay(video);
    };

    // Try to remove any controls that might interfere
    video.removeAttribute('controls');
    
    // Extra iOS-specific attributes for both videos (CRITICAL!)
    video.setAttribute('playsinline', ''); // lowercase for iOS
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'deny');
    if (video2) {
      video2.removeAttribute('controls');
      video2.setAttribute('playsinline', ''); // lowercase for iOS
      video2.setAttribute('webkit-playsinline', 'true');
      video2.setAttribute('x-webkit-airplay', 'deny');
      // Force muted state for video2 (critical for iOS autoplay)
      video2.muted = true;
      video2.defaultMuted = true;
    }

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Try to play on load - a few attempts
    setTimeout(() => attemptPlay(video), 100);
    setTimeout(() => attemptPlay(video), 500);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
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

    // Listen for ANY user interaction - more events
    const events = ['touchstart', 'touchmove', 'touchend', 'click', 'scroll', 'keydown', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
      window.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
        window.removeEventListener(event, handleUserInteraction);
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
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          activeVideo === 1 ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onEnded={handleVideoEnd}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      >
        <source src={videos[0]} type="video/mp4" />
      </video>

      {/* Video 2 */}
      <video
        ref={video2Ref}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          activeVideo === 2 ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
        }`}
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onEnded={handleVideoEnd}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      />

      {/* COMPLETELY INVISIBLE tap area for iOS - NO BUTTON VISIBLE */}
      {!isPlaying && !isLoading && (
        <div
          onClick={handlePlayClick}
          onTouchStart={handlePlayClick}
          className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-default md:hidden"
          aria-label="Tap anywhere to play video"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      )}

      {/* Overlay για καλύτερη αναγνωσιμότητα του text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/35 z-[2] pointer-events-none" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink/20 via-baby-blue/20 to-lavender/20 animate-pulse z-[3] pointer-events-none" />
      )}
    </div>
  );
}

