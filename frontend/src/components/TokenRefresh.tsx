import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth-store';

export function TokenRefresh() {
  const { checkTokenExpiry, refreshAccessToken } = useAuthStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const checkAndRefresh = () => {
      if (checkTokenExpiry()) {
        // Token is still valid, no need to refresh
        console.log('Token is still valid');
      } else {
        // Token is expired or close to expiry, try to refresh
        console.log('Token expired, refreshing...');
        refreshAccessToken();
      }
    };

    // Initial check
    checkAndRefresh();

    // Check every minute
    refreshTimerRef.current = setInterval(checkAndRefresh, 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [checkTokenExpiry, refreshAccessToken]);

  // This component doesn't render anything
  return null;
}
