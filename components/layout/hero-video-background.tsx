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
    // Only attempt play if video has enough data loaded (iOS requirement)
    if (video.readyState < 2) {
      console.log('⏳ Video not ready yet (readyState:', video.readyState, ') - waiting for loadeddata event');
      return;
    }

    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          console.log('✅ Hero video playing successfully');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log(`⚠️ Hero play attempt ${attempt} failed:`, error.message);
          if (attempt < retries) {
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

  // Initial load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted state (critical for iOS autoplay)
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', ''); // Extra safety for Safari iOS

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

    // Remove controls and add iOS-specific attributes
    video.removeAttribute('controls');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'deny');

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Single attempt only when ready - events will handle the rest
    if (video.readyState >= 2) {
      attemptPlay(video);
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
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
        console.log('🎮 User interacted, forcing hero video play');
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
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ 
          pointerEvents: 'none',
          objectFit: 'cover'
        }}
      >
        <source src="/heroVideo.mp4" type="video/mp4" />
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
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/20 via-transparent to-sage-900/40 pointer-events-none z-[2]" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-[2]" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-sage-100/30 to-mint-100/30 animate-pulse pointer-events-none z-[3]" />
      )}
    </div>
  );
}

