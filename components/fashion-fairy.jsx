"use client"

export function FashionFairy({ speaking = false, size = "md" }) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28 sm:w-32 sm:h-32",
    lg: "w-36 h-36 sm:w-44 sm:h-44",
  }

  return (
    <div className="fairy-container relative flex flex-col items-center">
      {/* Golden glow behind fairy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-full h-full rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, rgba(212,165,116,0.4) 0%, rgba(212,165,116,0.1) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Animated sparkles around fairy */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-2 left-2 text-amber-400 text-xs animate-sparkle-1">✦</span>
        <span className="absolute top-4 right-3 text-amber-300 text-sm animate-sparkle-2">✧</span>
        <span className="absolute bottom-8 left-4 text-amber-400 text-xs animate-sparkle-3">✦</span>
        <span className="absolute bottom-10 right-2 text-amber-300 text-xs animate-sparkle-1">✧</span>
      </div>

      {/* Fairy image */}
      <img
        src="/Edenfairy.png"
        alt="Stella - Your Fashion Guide"
        className={`${sizeClasses[size]} object-contain relative z-10 ${speaking ? "animate-fairy-speak" : "animate-fairy-float"}`}
        style={{
          filter: "drop-shadow(0 4px 20px rgba(212,165,116,0.5))",
        }}
      />

      {/* Name badge */}
      <div className="relative z-20 mt-2">
        <div className="px-4 py-1.5 bg-white border-2 border-amber-300 shadow-md">
          <span className="text-xs font-serif tracking-[0.2em] text-amber-700 uppercase font-semibold">Eden</span>
        </div>
      </div>
    </div>
  )
}
