"use client"

import type { ReactNode } from "react"
import { Lenis as LenisProvider } from "lenis/react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LenisProvider
      root
      options={{ lerp: 0.1, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}
    >
      {children}
    </LenisProvider>
  )
}
