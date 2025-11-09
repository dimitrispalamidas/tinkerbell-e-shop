'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/heroVideo.mp4" type="video/mp4" />
      </video>

      {/* Subtle overlay για καλύτερη αναγνωσιμότητα - πιο soft για premium look */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-sage-100/30 to-mint-100/30 animate-pulse" />
      )}
    </div>
  );
}

