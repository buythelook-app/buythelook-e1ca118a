"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import Lenis from "lenis"

const SmoothScrollContext = createContext({
  lenis: null,
  scrollTo: () => {},
})

export const useSmoothScroll = () => useContext(SmoothScrollContext)

export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null)
  const reqIdRef = useRef()

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    })

    setLenis(lenisInstance)

    function raf(time) {
      lenisInstance.raf(time)
      reqIdRef.current = requestAnimationFrame(raf)
    }

    reqIdRef.current = requestAnimationFrame(raf)

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current)
      }
      lenisInstance.destroy()
    }
  }, [])

  const scrollTo = (target, options) => {
    lenis?.scrollTo(target, { ...options })
  }

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
