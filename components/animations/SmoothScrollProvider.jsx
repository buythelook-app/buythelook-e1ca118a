"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import Lenis from "lenis"

const SmoothScrollContext = createContext(null)

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
    setIsReady(true)

    return () => {
      lenis.destroy()
    }
  }, [])

  const scrollTo = (target, options = {}) => {
    lenisRef.current?.scrollTo(target, options)
  }

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, lenis: lenisRef.current, isReady }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext)
  if (!context) {
    return { scrollTo: () => {}, lenis: null, isReady: false }
  }
  return context
}
