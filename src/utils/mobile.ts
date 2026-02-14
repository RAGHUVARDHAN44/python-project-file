// Mobile detection utilities
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Screen size utilities
export const isSmallScreen = (): boolean => {
  return window.innerWidth <= 768;
};

export const isLargeScreen = (): boolean => {
  return window.innerWidth > 1024;
};

// Touch detection
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Mobile-specific styling utilities
export const getMobileButtonClasses = (baseClasses: string = ''): string => {
  return `${baseClasses} mobile-button`;
};

export const getMobileCardClasses = (baseClasses: string = ''): string => {
  return `${baseClasses} mobile-card`;
};

// Performance optimization for mobile
export const optimizeForMobile = () => {
  // Reduce animation complexity on mobile
  if (isMobile()) {
    document.documentElement.style.setProperty('--animation-duration', '0.15s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }
};

// Memory management for mobile devices
export const manageMobileMemory = () => {
  if (isMobile()) {
    // Clear large objects when not in use
    if (window.gc) {
      window.gc();
    }
  }
};

// Battery optimization
export const isBatteryLow = async (): Promise<boolean> => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.level < 0.2; // 20% battery
    } catch (error) {
      return false;
    }
  }
  return false;
};

// Network status for mobile
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const getConnectionType = (): string => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return connection ? connection.effectiveType || 'unknown' : 'unknown';
};

// Mobile-specific error handling
export const handleMobileError = (error: Error, context: string) => {
  console.error(`Mobile Error [${context}]:`, error);
  
  // Log to analytics or error reporting service
  if ((window as any).gtag) {
    (window as any).gtag('event', 'mobile_error', {
      error_context: context,
      error_message: error.message,
      device_type: isMobile() ? 'mobile' : 'desktop',
      platform: isAndroid() ? 'android' : isIOS() ? 'ios' : 'other'
    });
  }
};

// Performance monitoring
export const measureMobilePerformance = (name: string, callback: () => void) => {
  if (performance.mark) {
    performance.mark(`${name}_start`);
    callback();
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
  } else {
    callback();
  }
};