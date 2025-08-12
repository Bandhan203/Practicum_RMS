import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

// Utility functions
export const isMobileScreen = (width) => width < BREAKPOINTS.mobile;
export const isTabletScreen = (width) => width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
export const isDesktopScreen = (width) => width >= BREAKPOINTS.tablet;
