/**
 * Safe Web Haptic Feedback Utility using navigator.vibrate
 */
export const haptics = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  },

  /** Light tick for button taps, likes, story navigations */
  lightTick(): void {
    try {
      if (this.isSupported()) {
        navigator.vibrate(12);
      }
    } catch {
      // ignore
    }
  },

  /** Success buzz for completed purchases, enrollments, saves */
  success(): void {
    try {
      if (this.isSupported()) {
        navigator.vibrate([20, 60, 25]);
      }
    } catch {
      // ignore
    }
  },

  /** Vote punch for 1v1 battle selection */
  vote(): void {
    try {
      if (this.isSupported()) {
        navigator.vibrate([35, 30, 35]);
      }
    } catch {
      // ignore
    }
  },

  /** Alert / Warning vibration */
  error(): void {
    try {
      if (this.isSupported()) {
        navigator.vibrate([50, 80, 50, 80, 50]);
      }
    } catch {
      // ignore
    }
  },

  /** New notification arrival */
  notification(): void {
    try {
      if (this.isSupported()) {
        navigator.vibrate([40, 70, 40]);
      }
    } catch {
      // ignore
    }
  }
};
