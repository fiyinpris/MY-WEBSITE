import { useEffect } from "react";

/** Locks page scroll (iOS-safe) while at least one overlay is open. */
let lockCount = 0;
let savedScrollY = 0;

export const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      const b = document.body.style;
      b.position = "fixed";
      b.top = `-${savedScrollY}px`;
      b.left = "0";
      b.right = "0";
      b.width = "100%";
      b.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        const b = document.body.style;
        b.position = "";
        b.top = "";
        b.left = "";
        b.right = "";
        b.width = "";
        b.overflow = "";
        window.scrollTo({ top: savedScrollY, behavior: "instant" });
      }
    };
  }, [active]);
};
