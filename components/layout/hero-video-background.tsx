'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Aggressive play strategy for iOS 12+
  const attemptPlay = (video: HTMLVideoElement, retries = 5) => {
    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          console.log('✅ Hero video playing successfully');
          setIsPlaying(true);
          setShowPlayButton(false);
        })
        .catch((error) => {
          console.log(`⚠️ Hero play attempt ${attempt} failed:`, error.message);
          if (attempt < retries) {
            setTimeout(() => tryPlay(attempt + 1), 300 * attempt);
          } else {
            // After all attempts fail, show elegant play button
            console.log('⚠️ Autoplay blocked - showing play button');
            setShowPlayButton(true);
            setIsLoading(false);
          }
        });
    };
    tryPlay(1);
  };

  // Handle manual play from overlay tap
  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      setHasInteracted(true);
      attemptPlay(video);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      setIsLoading(false); // Set loading to false when metadata loads
      attemptPlay(video);
    };

    // Try to remove any controls that might interfere
    video.removeAttribute('controls');
    
    // Extra iOS-specific attributes to prevent play button
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'deny');
    
    // Force muted state (critical for iOS autoplay)
    video.muted = true;
    video.defaultMuted = true;

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Try to play on load - a few attempts
    setTimeout(() => attemptPlay(video), 100);
    setTimeout(() => attemptPlay(video), 500);

    // Fallback: Force isLoading to false after 2 seconds
    // This ensures the tap area appears even if events don't fire properly on iOS
    const loadingTimeout = setTimeout(() => {
      console.log('⏱️ Loading timeout - forcing tap area to appear');
      setIsLoading(false);
    }, 2000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Intersection Observer - play when visible (for iOS 12+)
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
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
      
      const video = videoRef.current;
      if (video && video.paused) {
        console.log('🎮 Hero: User interacted, forcing play');
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
  }, [hasInteracted]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Video - NO PLAY BUTTON */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-hidden="true"
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      >
        <source src="/heroVideo.mp4" type="video/mp4" />
        {/* Empty captions track for accessibility compliance */}
        <track kind="captions" label="No audio" srcLang="en" />
      </video>

      {/* Elegant Play Button - Only shown when autoplay fails (iOS Low Power Mode, Data Saver, etc) */}
      {showPlayButton && !isPlaying && (
        <div
          onClick={handlePlayClick}
          onTouchStart={handlePlayClick}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group"
          aria-label="Tap to play video"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Elegant pulsing play button */}
          <div className="relative">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
            
            {/* Play button */}
            <div className="relative w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-300">
              {/* Play triangle */}
              <div className="w-0 h-0 border-l-[16px] border-l-sage-700 border-y-[10px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
      )}
      
      {/* COMPLETELY INVISIBLE tap area for iOS - When video is paused but autoplay not blocked */}
      {!isPlaying && !isLoading && !showPlayButton && (
        <div
          onClick={handlePlayClick}
          onTouchStart={handlePlayClick}
          className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-default md:hidden"
          aria-label="Tap anywhere to play video"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      )}

      {/* Premium subtle overlay - soft gradient for elegant readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/20 via-transparent to-sage-900/40 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-sage-100/30 to-mint-100/30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

