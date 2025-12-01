"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles, Search, Shirt, User, ScanLine, ShieldCheck ,Hourglass} from "lucide-react"

const steps = [
  {
    id: 1,
    name: "Image Analysis",
    description: "Decoding visual cues & body metrics",
    icon: ScanLine,
  },
  {
    id: 2,
    name: "Style Profile",
    description: "Synthesizing your unique aesthetic",
    icon: User,
  },
  {
    id: 3,
    name: "Global Search",
    description: "Curating from premium collections",
    icon: Search,
  },
  {
    id: 4,
    name: "Look Architecture",
    description: "Assembling cohesive outfits",
    icon: Shirt,
  },
  {
    id: 5,
    name: "Final Polish",
    description: "Verifying harmony & fit",
    icon: ShieldCheck,
  },
]

export function AgentWorkflow({ currentStep, logs, skipImageAnalysis = false }) {
  const activeSteps = skipImageAnalysis ? steps.filter((s) => s.id !== 1) : steps
  const activeStep = activeSteps[currentStep] || activeSteps[activeSteps.length - 1]

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md mb-6">
          <Sparkles className="w-3 h-3 text-accent animate-pulse" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent">AI Stylist Active</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground mb-4">
          Curating Your <span className="italic text-accent">Signature Look</span>
        </h1>
        <p className="text-muted-foreground text-lg font-light tracking-wide max-w-xl mx-auto">
          Our agents are analyzing thousands of combinations to find your perfect match.
        </p>

         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 180, 180, 360] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Hourglass className="w-5 h-5 text-accent" />
          </motion.div>
          <span className="text-sm text-accent font-medium">This process may take up to one minute</span>
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Progress Steps */}
        <div className="lg:col-span-5 space-y-8 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {activeSteps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isPending = index > currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-6 group ${isPending ? "opacity-40" : "opacity-100"}`}
              >
                {/* Icon Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-700
                    ${isActive ? "border-accent bg-background scale-110 shadow-[0_0_30px_-10px_rgba(var(--accent),0.3)]" : ""}
                    ${isCompleted ? "border-accent/30 bg-accent/5 text-accent" : ""}
                    ${isPending ? "border-border bg-background text-muted-foreground" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${isActive ? "text-accent animate-pulse" : ""}`} />
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${isActive ? "text-accent" : "text-foreground/60"}`}
                    >
                      {step.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-light tracking-wide">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Right Column: Active Visualization Card */}
        <div className="lg:col-span-7">
          <motion.div
            layoutId="active-card"
            className="relative aspect-[4/3] rounded-none border border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full border border-accent/20 flex items-center justify-center mb-6 bg-background/50 backdrop-blur-sm shadow-lg">
                    <activeStep.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-serif text-foreground mb-2">{activeStep.name}</h2>
                  <p className="text-muted-foreground font-light tracking-wide mb-8 max-w-xs">
                    {activeStep.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Live Status Line */}
              <div className="absolute bottom-8 left-0 right-0 px-8">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-4" />
                <div className="h-6 overflow-hidden relative">
                  <AnimatePresence mode="popLayout">
                    {logs.slice(-1).map((log, i) => (
                      <motion.div
                        key={log + i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-xs font-mono text-accent/80 tracking-wider text-center w-full absolute"
                      >
                        {log.replace("> ", "")}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
