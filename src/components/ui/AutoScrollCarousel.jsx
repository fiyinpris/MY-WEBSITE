import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Continuously auto-scrolling product carousel (the original landing-page
 * behaviour), rebuilt to be smooth and seamless:
 * - glides on its own in an infinite loop
 * - pauses while hovered or focused
 * - can be dragged / swiped, and nudged with the arrow buttons
 * - respects "reduce motion" (no autoplay, still draggable)
 */
export const AutoScrollCarousel = ({
  items,
  renderItem,
  getKey = (item) => item.id,
  speed = 38, // px per second
  itemClassName,
  className,
  ariaLabel = "Carousel",
  showArrows = true,
}) => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const firstSetRef = useRef(null);
  const offset = useRef(0);
  const setWidth = useRef(0);
  const paused = useRef(false);
  const tweening = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startOffset: 0, id: null });
  const [copies, setCopies] = useState(2);
  const reduceMotion = useReducedMotion();

  const normalize = useCallback((v) => {
    const w = setWidth.current;
    if (!w) return v;
    let n = v % w;
    if (n > 0) n -= w;
    return n;
  }, []);

  const apply = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${normalize(offset.current)}px,0,0)`;
    }
  }, [normalize]);

  // Measure one set of items and decide how many copies fill the viewport
  useEffect(() => {
    const measure = () => {
      const set = firstSetRef.current;
      const vp = viewportRef.current;
      if (!set || !vp) return;
      setWidth.current = set.offsetWidth;
      const needed = setWidth.current > 0 ? Math.ceil(vp.offsetWidth / setWidth.current) + 1 : 2;
      setCopies(Math.max(2, Math.min(needed, 6)));
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (firstSetRef.current) ro.observe(firstSetRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [items, apply]);

  // Animation loop
  useEffect(() => {
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!paused.current && !drag.current.active && !tweening.current && !reduceMotion && !document.hidden) {
        offset.current = normalize(offset.current - (speed * dt) / 1000);
        apply();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed, reduceMotion, apply, normalize]);

  const nudge = (dir) => {
    tweening.current?.stop();
    const item = firstSetRef.current?.firstElementChild;
    const gap = parseFloat(getComputedStyle(firstSetRef.current || document.body).columnGap) || 16;
    const step = (item?.offsetWidth || 240) + gap;
    const from = offset.current;
    tweening.current = animate(from, from - dir * step, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        offset.current = v;
        apply();
      },
      onComplete: () => {
        offset.current = normalize(offset.current);
        tweening.current = null;
      },
    });
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    tweening.current?.stop();
    tweening.current = null;
    drag.current = { active: true, moved: false, startX: e.clientX, startOffset: offset.current, id: e.pointerId };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      viewportRef.current?.setPointerCapture?.(d.id);
    }
    if (d.moved) {
      offset.current = normalize(d.startOffset + dx);
      apply();
    }
  };
  const endDrag = () => {
    const d = drag.current;
    if (d.active && d.moved) viewportRef.current?.releasePointerCapture?.(d.id);
    d.active = false;
  };
  // Prevent the click that ends a drag from opening a product
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className="edge-fade -my-4 cursor-grab touch-pan-y select-none overflow-hidden py-4 pb-10 active:cursor-grabbing"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => {
          paused.current = false;
          endDrag();
        }}
        onFocusCapture={() => (paused.current = true)}
        onBlurCapture={() => (paused.current = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {Array.from({ length: copies }).map((_, copy) => (
            <div
              key={copy}
              ref={(el) => {
                if (copy === 0) firstSetRef.current = el;
                if (el) {
                  if (copy > 0) el.setAttribute("inert", "");
                  else el.removeAttribute("inert");
                }
              }}
              aria-hidden={copy > 0 ? "true" : undefined}
              className="flex gap-4 pr-4 sm:gap-6 sm:pr-6"
            >
              {items.map((item, i) => (
                <div key={`${copy}-${getKey(item)}`} className={cn("shrink-0", itemClassName)}>
                  {renderItem(item, i, copy)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <div className="mt-2 flex justify-center gap-3">
          <button onClick={() => nudge(-1)} aria-label="Previous products" className="btn btn-outline size-11 !rounded-full !p-0">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => nudge(1)} aria-label="Next products" className="btn btn-outline size-11 !rounded-full !p-0">
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
