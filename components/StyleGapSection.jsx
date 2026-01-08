"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const StyleGapSection = () => {
  const sectionRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      setScrollProgress(clampedProgress);
      setParallaxOffset((clampedProgress - 0.5) * 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-white overflow-hidden h-screen min-h-[700px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="h-full max-w-[1920px] mx-auto">
        <div className="grid lg:grid-cols-2 h-full">
          {/* Left: Text Content */}
          <div className="relative flex items-center px-6 sm:px-8 lg:px-16 xl:px-24 py-16 lg:py-0">
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-px bg-gradient-to-b from-transparent via-neutral-900 to-transparent transition-all duration-[1.5s] ease-out ${
                isVisible ? "h-1/2 opacity-100" : "h-0 opacity-0"
              }`}
              style={{ transitionDelay: "0.8s" }}
            />

            <div className="max-w-xl">
              <div
                className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "0.3s" }}
              >
                <div
                  className={`h-px bg-neutral-400 transition-all duration-1000 ${
                    isVisible ? "w-16" : "w-0"
                  }`}
                  style={{ transitionDelay: "0.6s" }}
                />
                <span className="text-neutral-500 font-sans text-[10px] tracking-[0.35em] uppercase">
                  The Style Gap
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-neutral-900 transition-opacity duration-500 ${
                    isVisible ? "opacity-100 animate-pulse" : "opacity-0"
                  }`}
                />
              </div>

              <div className="overflow-hidden mb-2">
                <h2
                  className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl text-neutral-900 leading-[1.1] tracking-[-0.02em] transition-all duration-[1.2s] ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
                  }`}
                  style={{ transitionDelay: "0.4s" }}
                >
                  Fashion is Infinite.
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2
                  className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl italic font-light text-neutral-400 leading-[1.1] tracking-[-0.01em] transition-all duration-[1.2s] ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
                  }`}
                  style={{ transitionDelay: "0.6s" }}
                >
                  Your Time Isn't.
                </h2>
              </div>

              <div
                className={`my-8 lg:my-10 h-px bg-gradient-to-r from-neutral-200 via-neutral-400 to-transparent transition-all duration-1000 ${
                  isVisible ? "w-24 opacity-100" : "w-0 opacity-0"
                }`}
                style={{ transitionDelay: "0.9s" }}
              />

              <div
                className={`space-y-5 transition-all duration-[1.2s] ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "1s" }}
              >
                <p className="font-sans text-sm sm:text-base text-neutral-600 leading-[1.8]">
                  Online shopping shouldn't feel like a second job. Between endless tabs, conflicting
                  style advice, and the guesswork of what actually works together, finding the right
                  outfit is exhausting.
                </p>
                <p className="font-sans text-sm sm:text-base text-neutral-600 leading-[1.8]">
                  <span className="text-neutral-900 font-medium">Buy the Look</span> bridges that gap,
                  turning uncertainty into confidence with curated looks that actually make sense for you.
                </p>
                <p className="font-sans text-sm sm:text-base text-neutral-600 leading-[1.8]">
                  We've partnered with the world's largest retailers – from luxury fashion houses to
                  high-street favorites – to give you a personal stylist's touch with the speed of AI.
                </p>
              </div>

              <div
                className={`mt-10 lg:mt-12 transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "1.3s" }}
              >
                <button className="group relative px-10 py-5 bg-neutral-900 text-white font-sans text-[11px] tracking-[0.25em] uppercase overflow-hidden transition-all duration-500 hover:bg-neutral-800 hover:shadow-2xl hover:shadow-neutral-900/30 hover:scale-[1.02]">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Style Quiz
                    <span className="inline-block transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 opacity-70">
                      →
                    </span>
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Cinematic Image */}
          <div className="relative overflow-hidden hidden lg:block">
            <div
              className={`absolute inset-0 bg-white z-30 transition-all duration-[1.4s] ease-[cubic-bezier(0.77,0,0.175,1)] origin-left ${
                isVisible ? "translate-x-full" : "translate-x-0"
              }`}
              style={{ transitionDelay: "0.2s" }}
            />

            <div
              className="absolute inset-0"
              style={{
                transform: `translateY(${parallaxOffset}px) scale(${1.1 + scrollProgress * 0.05})`,
                transition: "transform 0.15s ease-out",
              }}
            >
              <Image
                src="/luxury-fashion-hero.jpg"
                alt="Luxury fashion editorial"
                fill
                sizes="50vw"
                priority
                className={`object-cover object-center transition-all duration-[1.5s] ${
                  imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/5 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5 z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 z-10" />

            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20"
              style={{
                opacity: isHovering ? 0.6 : 0,
                background: `radial-gradient(ellipse 400px 600px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 70%)`,
              }}
            />

            <div
              className={`absolute inset-8 border border-white/20 pointer-events-none z-20 transition-all duration-[1.2s] ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "1.2s" }}
            />

            <div
              className={`absolute top-8 left-8 w-16 h-16 pointer-events-none z-20 transition-all duration-700 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "1.4s" }}
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px] bg-white/50 origin-left transition-transform duration-700"
                style={{ transform: isVisible ? "scaleX(1)" : "scaleX(0)", transitionDelay: "1.5s" }}
              />
              <div
                className="absolute top-0 left-0 w-[2px] h-full bg-white/50 origin-top transition-transform duration-700"
                style={{ transform: isVisible ? "scaleY(1)" : "scaleY(0)", transitionDelay: "1.6s" }}
              />
            </div>
            <div
              className={`absolute bottom-8 right-8 w-16 h-16 pointer-events-none z-20 transition-all duration-700 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "1.4s" }}
            >
              <div
                className="absolute bottom-0 right-0 w-full h-[2px] bg-white/50 origin-right transition-transform duration-700"
                style={{ transform: isVisible ? "scaleX(1)" : "scaleX(0)", transitionDelay: "1.7s" }}
              />
              <div
                className="absolute bottom-0 right-0 w-[2px] h-full bg-white/50 origin-bottom transition-transform duration-700"
                style={{ transform: isVisible ? "scaleY(1)" : "scaleY(0)", transitionDelay: "1.8s" }}
              />
            </div>

            <div
              className={`absolute bottom-12 left-12 z-30 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "1.8s" }}
            >
              <span className="text-white/70 font-sans text-[9px] tracking-[0.4em] uppercase">
                Editorial 2025
              </span>
            </div>
          </div>

          {/* Mobile Image */}
          <div className="relative h-[60vh] overflow-hidden lg:hidden">
            <div
              className="absolute inset-0"
              style={{ transform: `translateY(${parallaxOffset * 0.3}px) scale(1.08)` }}
            >
              <Image
                src="/luxury-fashion-hero.jpg"
                alt="Luxury fashion"
                fill
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-white/40" />
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "2s" }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
      </div>
    </section>
  );
};

export default StyleGapSection;
