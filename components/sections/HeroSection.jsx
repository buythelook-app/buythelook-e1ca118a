import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/animations/MagneticElements";
import { TextScramble } from "@/components/animations/TextEffects";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function HeroSection({ onGetStyled, onHowItWorks }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.8]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
   <section
  ref={containerRef}
  id="hero"  // ADD THIS
  className="w-full relative min-h-[100svh] flex items-center justify-center overflow-hidden"
>
      {/* Video Background with parallax */}
      <div className="absolute inset-0 overflow-hidden bg-foreground">
        {!isLoaded && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-muted to-foreground" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        <motion.div
          className="absolute inset-0"
          style={{ scale: videoScale }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onCanPlay={() => setIsLoaded(true)}
          >
            <source src="https://www.buythelook.app/ved.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Dynamic overlay */}
        <motion.div 
          className="absolute inset-0 bg-foreground"
          style={{ opacity: overlayOpacity }}
        />

        {/* Overlays */}
        <div className="video-overlay-top" />
        <div className="video-overlay-bottom" />
        <div className="absolute inset-y-0 left-0 w-[25%] bg-gradient-to-r from-foreground/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[25%] bg-gradient-to-l from-foreground/40 to-transparent" />
        <div className="video-overlay-sides" />
      </div>

      {/* Video Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-6 right-6 z-30 flex items-center gap-3"
      >
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all duration-300"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all duration-300"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <TextScramble className="text-[8px] sm:text-[9px] md:text-[11px] font-medium tracking-[0.3em] uppercase text-primary-foreground/60">
            Scroll to Explore
          </TextScramble>
          <motion.div 
            className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-primary-foreground/40 to-transparent"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 2.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
          />
        </motion.div>
      </motion.div>

      {/* Hero Content with parallax */}
      <motion.div 
        className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto py-20 sm:py-0"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <h1 className="text-[11vw] xs:text-[10vw] sm:text-[9vw] md:text-[7vw] lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.95] font-serif tracking-[-0.02em] text-primary-foreground mb-4 sm:mb-6 md:mb-8">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "100%", opacity: 0, rotateX: -80 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="block"
              style={{ transformOrigin: "bottom", perspective: "1000px" }}
            >
              Your AI Personal
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "100%", opacity: 0, rotateX: -80 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="block italic font-light text-primary-foreground/95"
              style={{ transformOrigin: "bottom", perspective: "1000px" }}
            >
              Stylist
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.1 }}
          className="text-sm sm:text-base md:text-xl lg:text-2xl text-primary-foreground/75 font-light max-w-xs sm:max-w-md md:max-w-lg mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2"
        >
          Complete outfits curated for you. Shop instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <MagneticButton
            onClick={onGetStyled}
            className="group w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 bg-primary-foreground text-foreground hover:bg-primary-foreground/95 text-sm font-medium tracking-wide transition-all duration-300"
            strength={0.2}
          >
            <span className="flex items-center gap-2">
              Get Styled Now
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
          </MagneticButton>

          <MagneticButton
            onClick={onHowItWorks}
            className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 bg-transparent border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 text-sm font-medium tracking-wide transition-all duration-300"
            strength={0.15}
          >
            How It Works
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-10 sm:mt-14 md:mt-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {[
              { value: "AI-Powered", label: "Personalized to your style" },
              { value: "Instant Shopping", label: "Direct links to every piece" },
              { value: "Zero Effort", label: "Perfect outfits in minutes" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + i * 0.1, duration: 0.6 }}
              >
                <div className="text-base sm:text-lg md:text-2xl lg:text-3xl font-light text-primary-foreground/90 tracking-wide whitespace-nowrap">
                  {stat.value}
                </div>
                <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] uppercase text-primary-foreground/70 mt-1 max-w-[140px] sm:max-w-none mx-auto">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-8 w-[1px] h-32 bg-gradient-to-b from-transparent via-primary-foreground/20 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute top-1/3 right-8 w-[1px] h-24 bg-gradient-to-b from-transparent via-primary-foreground/20 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  );
}
