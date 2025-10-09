import { useRef, useEffect } from 'react';

/**
 * Custom hook to preserve scroll position when components re-render
 * @param {string} id - Unique identifier for the scrollable element
 * @returns {React.RefObject} - Ref to attach to the scrollable element
 */
const useScrollPreservation = (id) => {
  const scrollRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Save scroll position before re-render
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      scrollPositionRef.current = element.scrollTop;
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after re-render
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Use requestAnimationFrame to ensure DOM is fully updated
    const restorePosition = () => {
      if (element.scrollTop !== scrollPositionRef.current) {
        element.scrollTop = scrollPositionRef.current;
      }
    };

    const frameId = requestAnimationFrame(restorePosition);
    return () => cancelAnimationFrame(frameId);
  });

  return scrollRef;
};

export default useScrollPreservation;