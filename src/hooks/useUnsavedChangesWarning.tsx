import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onNavigationAttempt: () => void;
  isNavigating?: boolean;
}

/**
 * Hook to warn users about unsaved changes before navigation
 * Blocks browser back/forward and refresh
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  onNavigationAttempt,
  isNavigating = false,
}: UseUnsavedChangesWarningProps) {
  const router = useRouter();

  // Warn on browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isNavigating]);

  // Block browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !isNavigating) {
        e.preventDefault();
        // Push state back to keep user on page
        window.history.pushState(null, '', window.location.pathname);
        onNavigationAttempt();
      }
    };

    if (hasUnsavedChanges) {
      // Add a history entry to intercept back button
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, isNavigating, onNavigationAttempt]);

  // Intercept all link clicks on the page
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (hasUnsavedChanges && !isNavigating) {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && link.href) {
          // Check if it's an internal navigation
          const currentOrigin = window.location.origin;
          const linkUrl = new URL(link.href, currentOrigin);
          
          if (linkUrl.origin === currentOrigin && linkUrl.pathname !== window.location.pathname) {
            e.preventDefault();
            e.stopPropagation();
            onNavigationAttempt();
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges, isNavigating, onNavigationAttempt]);
}
