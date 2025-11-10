'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Aggressive play strategy for iOS 12+
  const attemptPlay = (video: HTMLVideoElement, retries = 10) => {
    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          console.log('✅ Hero video playing successfully');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log(`⚠️ Hero play attempt ${attempt} failed:`, error.message);
          if (attempt < retries) {
            // Exponential backoff with more attempts
            setTimeout(() => tryPlay(attempt + 1), 200 * attempt);
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

    // Force muted state FIRST (critical for iOS autoplay)
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    
    // Force load the video
    video.load();

    const handleCanPlay = () => {
      console.log('📺 Hero video can play - attempting autoplay');
      setIsLoading(false);
      attemptPlay(video);
    };

    const handleLoadedData = () => {
      console.log('📺 Hero video data loaded - attempting autoplay');
      attemptPlay(video);
    };

    const handleLoadedMetadata = () => {
      console.log('📺 Hero video metadata loaded - attempting autoplay');
      setIsLoading(false);
      attemptPlay(video);
    };

    // Try to remove any controls that might interfere
    video.removeAttribute('controls');
    
    // Extra iOS-specific attributes to prevent play button
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'deny');

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Aggressive autoplay attempts
    setTimeout(() => attemptPlay(video), 100);
    setTimeout(() => attemptPlay(video), 300);
    setTimeout(() => attemptPlay(video), 500);
    setTimeout(() => attemptPlay(video), 1000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Intersection Observer - play when visible
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
            console.log('📺 Hero video is visible, attempting to play');
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

    // Listen for ANY user interaction
    const events = ['touchstart', 'click', 'scroll'];
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

