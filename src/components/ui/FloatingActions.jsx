import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { STORE_CONTACT } from "../../lib/contact";
import { cn } from "../../lib/utils";

/** Thin burgundy → gold line at the very top that fills as you scroll. */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary via-primary to-accent"
      style={{ scaleX }}
    />
  );
};

/**
 * Floating WhatsApp chat button + back-to-top button (with a progress ring),
 * bottom-right on every page.
 */
export const FloatingActions = () => {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const unsub = scrollYProgress.on("change", (v) => setProgress(v));
    return () => {
      window.removeEventListener("scroll", onScroll);
      unsub();
    };
  }, [scrollYProgress]);

  // Product pages have a sticky "Add to cart" bar on phones — sit above it.
  const raised = pathname.startsWith("/product/");
  const circumference = 2 * Math.PI * 21;

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-3 transition-[bottom] duration-300 sm:right-6",
        raised ? "bottom-24 md:bottom-6" : "bottom-5 sm:bottom-6",
      )}
    >
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="pointer-events-auto relative flex size-12 items-center justify-center rounded-full border bg-card/90 text-foreground shadow-card backdrop-blur transition-colors hover:text-primary"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.a
            key="wa"
            href={STORE_CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group pointer-events-auto relative flex items-center"
          >
            <span className="pointer-events-none mr-3 hidden translate-x-2 whitespace-nowrap rounded-full bg-foreground px-3.5 py-2 text-xs font-semibold text-background opacity-0 shadow-card transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
              Chat with us
            </span>
            <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_28px_-10px_rgba(37,211,102,0.7)] transition-transform duration-300 group-hover:scale-110">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-25 [animation-duration:2.6s]" />
              <FaWhatsapp size={26} className="relative" />
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
};
