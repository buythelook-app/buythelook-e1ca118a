import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const [cursorState, setCursorState] = useState({
    isHovering: false,
    isClicking: false,
    hoverType: "default",
  });
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Smooth spring animation for cursor following
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Outer ring with more lag
  const ringConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  const ringXSpring = useSpring(cursorX, ringConfig);
  const ringYSpring = useSpring(cursorY, ringConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }));
    };

    // Detect hoverable elements
    const handleElementHover = (e) => {
      const target = e.target;
      
      if (target.closest('[data-cursor="magnetic"]')) {
        setCursorState({ isHovering: true, isClicking: false, hoverType: "magnetic" });
      } else if (target.closest('button') || target.closest('[data-cursor="button"]')) {
        setCursorState({ isHovering: true, isClicking: false, hoverType: "button" });
      } else if (target.closest('a') || target.closest('[data-cursor="link"]')) {
        setCursorState({ isHovering: true, isClicking: false, hoverType: "link" });
      } else if (target.closest('img') || target.closest('[data-cursor="image"]')) {
        setCursorState({ isHovering: true, isClicking: false, hoverType: "image", text: "View" });
      } else if (target.closest('[data-cursor="text"]')) {
        const text = target.closest('[data-cursor="text"]')?.getAttribute('data-cursor-text') || "";
        setCursorState({ isHovering: true, isClicking: false, hoverType: "text", text });
      } else {
        setCursorState({ isHovering: false, isClicking: false, hoverType: "default" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleElementHover);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleElementHover);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  const getCursorSize = () => {
    if (cursorState.isClicking) return 8;
    switch (cursorState.hoverType) {
      case "button":
      case "magnetic":
        return 60;
      case "link":
        return 40;
      case "image":
      case "text":
        return 80;
      default:
        return 12;
    }
  };

  const getRingSize = () => {
    if (cursorState.isClicking) return 30;
    switch (cursorState.hoverType) {
      case "button":
      case "magnetic":
        return 80;
      case "link":
        return 60;
      case "image":
      case "text":
        return 100;
      default:
        return 40;
    }
  };

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * { cursor: none !important; }
        a, button, [role="button"] { cursor: none !important; }
      `}</style>

      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        animate={{
          width: getCursorSize(),
          height: getCursorSize(),
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <motion.div
          className="w-full h-full rounded-full bg-primary-foreground flex items-center justify-center"
          style={{ transform: "translate(-50%, -50%)" }}
          animate={{
            scale: cursorState.isClicking ? 0.8 : 1,
          }}
        >
          <AnimatePresence>
            {cursorState.text && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-foreground text-[10px] font-medium tracking-wider uppercase"
              >
                {cursorState.text}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          x: ringXSpring,
          y: ringYSpring,
        }}
        animate={{
          width: getRingSize(),
          height: getRingSize(),
          opacity: isVisible ? (cursorState.isHovering ? 0.5 : 0.3) : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div
          className="w-full h-full rounded-full border border-primary-foreground/50"
          style={{ transform: "translate(-50%, -50%)" }}
          animate={{
            borderWidth: cursorState.isHovering ? 2 : 1,
          }}
        />
      </motion.div>
    </>
  );
}
