'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Aggressive play strategy for iOS 12+
  const attemptPlay = (video: HTMLVideoElement, retries = 5) => {
    const tryPlay = (attempt: number) => {
      video.play()
        .then(() => {
          console.log('✅ Hero video playing successfully');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log(`⚠️ Hero play attempt ${attempt} failed:`, error.message);
          if (attempt < retries) {
            setTimeout(() => tryPlay(attempt + 1), 300 * attempt);
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
    
    // Try to remove any controls that might interfere
    video.removeAttribute('controls');
    
    // Extra iOS-specific attributes to prevent play button (CRITICAL!)
    video.setAttribute('playsinline', ''); // lowercase for iOS
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x-webkit-airplay', 'deny');
    video.setAttribute('muted', ''); // Force muted attribute
    
    // Force load the video
    video.load();

    const handleCanPlay = () => {
      setIsLoading(false);
      // Immediate aggressive play
      video.play().then(() => {
        console.log('✅ Hero video playing on canplay');
        setIsPlaying(true);
      }).catch(() => {
        attemptPlay(video);
      });
    };

    const handleLoadedData = () => {
      // Immediate aggressive play
      video.play().then(() => {
        console.log('✅ Hero video playing on loadeddata');
        setIsPlaying(true);
      }).catch(() => {
        attemptPlay(video);
      });
    };

    const handleLoadedMetadata = () => {
      // Immediate aggressive play
      video.play().then(() => {
        console.log('✅ Hero video playing on loadedmetadata');
        setIsPlaying(true);
      }).catch(() => {
        attemptPlay(video);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // SUPER AGGRESSIVE: Try to play immediately and repeatedly
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 50);
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 100);
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 200);
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 300);
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 500);
    setTimeout(() => {
      video.play().catch(() => attemptPlay(video));
    }, 1000);

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

  // Persistent retry loop for iOS - keep trying until video plays
  useEffect(() => {
    if (isPlaying) return;

    const video = videoRef.current;
    if (!video) return;

    const retryInterval = setInterval(() => {
      if (!isPlaying && video.paused && video.readyState >= 2) {
        console.log('🔄 Retry: Attempting to play hero video...');
        attemptPlay(video);
      }
    }, 1000); // Try every 1 second

    return () => clearInterval(retryInterval);
  }, [isPlaying]);

  // Smart trick: Simulate tiny interaction to unlock iOS autoplay
  useEffect(() => {
    if (isPlaying) return;

    // Wait a bit for page to load, then simulate interaction
    const timer = setTimeout(() => {
      // Trigger a tiny scroll to "unlock" autoplay policy
      window.scrollBy(0, 1);
      setTimeout(() => window.scrollBy(0, -1), 50); // Scroll back
      
      // Then try to play
      const video = videoRef.current;
      if (video && video.paused) {
        console.log('🎯 After micro-scroll, attempting play');
        video.play().catch(() => attemptPlay(video));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying]);

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
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.play().catch(() => console.log('Autoplay blocked'));
        }}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-hidden="true"
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
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/20 via-transparent to-sage-900/40 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-sage-100/30 to-mint-100/30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

