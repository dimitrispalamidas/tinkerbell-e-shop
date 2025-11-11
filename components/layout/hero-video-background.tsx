'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryAutoplay = async () => {
      try {
        await video.play();
      } catch {
        setShowTapHint(true);
      }
    };

    if (video.readyState >= 2) {
      tryAutoplay();
    } else {
      video.addEventListener('canplay', tryAutoplay, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', tryAutoplay);
    };
  }, []);

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setShowTapHint(false));
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 
        ΚΡΙΣΙΜΟ για iOS Safari:
        - Όλα τα attributes στο HTML (όχι σε useEffect)
        - webkit-playsinline="true" για παλιότερα iOS
        - x-webkit-airplay="deny" για να μην εμφανίζεται AirPlay
        - Video ΧΩΡΙΣ ήχο (mute track) στο αρχείο
      */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectFit: 'cover' }}
      >
        <source src="/heroVideo.mp4" type="video/mp4" />
      </video>

      {/* Invisible tap layer - μόνο αν το autoplay απέτυχε */}
      {showTapHint && (
        <div
          onClick={handleTap}
          onTouchStart={handleTap}
          className="absolute inset-0 z-10 bg-transparent cursor-pointer md:hidden"
          aria-label="Tap to play video"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      )}

      {/* Overlays για καλύτερη αναγνωσιμότητα */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/20 via-transparent to-sage-900/40 pointer-events-none z-[2]" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-[2]" />
    </div>
  );
}

