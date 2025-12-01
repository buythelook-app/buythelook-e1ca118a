"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWebViewAppName, getExternalBrowserUrl, isIOS, isAndroid } from "@/lib/webview-detect"

export default function WebViewWarning({ onClose }) {
  const [copied, setCopied] = useState(false)
  const appName = getWebViewAppName()
  const url = getExternalBrowserUrl()

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getBrowserInstructions = () => {
    if (isIOS()) {
      return "Tap the ••• menu and select 'Open in Safari'"
    }
    if (isAndroid()) {
      return "Tap the ⋮ menu and select 'Open in Chrome'"
    }
    return "Open this link in your browser"
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="pt-10 pb-6 flex justify-center">
          <div className="w-20 h-20 bg-amber-50 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-amber-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h2 className="text-2xl font-serif text-neutral-900 mb-3">Open in Browser</h2>
          <p className="text-sm text-neutral-600 mb-2">Google sign-in doesn't work inside {appName}'s browser.</p>
          <p className="text-sm text-neutral-500">{getBrowserInstructions()}</p>
        </div>

        {/* URL Copy Section */}
        <div className="px-8 pb-6">
          <div className="bg-neutral-50 border border-neutral-200 p-3 flex items-center gap-3">
            <div className="flex-1 truncate text-sm text-neutral-600 font-mono">{url}</div>
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="sm"
              className="shrink-0 h-8 px-3 border-neutral-300 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-8 pb-8">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-medium shrink-0">
                1
              </div>
              <p className="text-sm text-neutral-600 pt-0.5">Copy the URL above</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-medium shrink-0">
                2
              </div>
              <p className="text-sm text-neutral-600 pt-0.5">
                Open {isIOS() ? "Safari" : isAndroid() ? "Chrome" : "your browser"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-medium shrink-0">
                3
              </div>
              <p className="text-sm text-neutral-600 pt-0.5">Paste the URL and sign in with Google</p>
            </div>
          </div>
        </div>

        {/* Alternative */}
        <div className="px-8 pb-8 pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 text-center">
            Or use email/password sign-in which works in any browser
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
