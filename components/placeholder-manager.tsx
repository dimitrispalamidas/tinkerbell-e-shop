'use client';

import { useEffect } from 'react';

export function PlaceholderManager() {
  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        target.dataset.placeholder = target.placeholder;
        target.placeholder = '';
      }
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.value) {
        target.placeholder = target.dataset.placeholder || '';
      }
    };

    // Add event listeners
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('focusout', handleBlur, true);
    };
  }, []);

  return null;
}

