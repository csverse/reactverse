import { useCallback, useEffect, useRef, useState } from "react";

export function useHovered<T extends HTMLElement = HTMLDivElement>() {
  const [isHover, setIsHover] = useState(false);
  const ref = useRef<T>(null);
  const onMouseEnter = useCallback(() => setIsHover(true), []);
  const onMouseLeave = useCallback(() => setIsHover(false), []);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mouseenter', onMouseEnter);
      ref.current.addEventListener('mouseleave', onMouseLeave);

      return () => {
        ref.current?.removeEventListener('mouseenter', onMouseEnter);
        ref.current?.removeEventListener('mouseenter', onMouseEnter);
      }
    }
    return undefined;
  }, [])

  return { ref, isHover };
}

export default useHovered;
