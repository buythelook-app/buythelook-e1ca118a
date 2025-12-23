"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function TypewriterInput({ value, onChange, placeholder, className }) {
  const [displayPlaceholder, setDisplayPlaceholder] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isFocused || value) {
      setDisplayPlaceholder("")
      return
    }

    let index = 0
    setDisplayPlaceholder("")

    const typeInterval = setInterval(() => {
      if (index < placeholder.length) {
        setDisplayPlaceholder(placeholder.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
      }
    }, 60)

    return () => clearInterval(typeInterval)
  }, [placeholder, isFocused, value])

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent border-0 border-b border-border focus:border-foreground text-foreground text-base sm:text-lg md:text-xl py-3 sm:py-4 outline-none transition-colors duration-300 placeholder:text-transparent"
        placeholder=""
      />
      {!value && !isFocused && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground text-base sm:text-lg md:text-xl pointer-events-none flex items-center">
          <span>{displayPlaceholder}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="ml-0.5 w-[2px] h-5 sm:h-6 bg-muted-foreground inline-block"
          />
        </div>
      )}
    </div>
  )
}
