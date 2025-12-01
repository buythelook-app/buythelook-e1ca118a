"use client"

/**
 * Detects if the current browser is a WebView (Instagram, Facebook, TikTok, etc.)
 * These WebViews block Google OAuth with "403: disallowed_useragent"
 */
export function isWebView() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera

  // Common WebView indicators
  const webViewPatterns = [
    // Instagram
    /Instagram/i,
    // Facebook
    /FBAN|FBAV|FB_IAB|FB4A|FBIOS/i,
    // TikTok
    /musical_ly|BytedanceWebview|TikTok/i,
    // Twitter/X
    /Twitter/i,
    // LinkedIn
    /LinkedInApp/i,
    // Snapchat
    /Snapchat/i,
    // Pinterest
    /Pinterest/i,
    // WeChat
    /MicroMessenger/i,
    // Line
    /Line\//i,
    // Generic WebView indicators
    /WebView|wv\)/i,
  ]

  return webViewPatterns.some((pattern) => pattern.test(ua))
}

/**
 * Gets the name of the WebView app if detected
 */
export function getWebViewAppName() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera

  if (/Instagram/i.test(ua)) return "Instagram"
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return "Facebook"
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "TikTok"
  if (/Twitter/i.test(ua)) return "Twitter"
  if (/LinkedInApp/i.test(ua)) return "LinkedIn"
  if (/Snapchat/i.test(ua)) return "Snapchat"
  if (/Pinterest/i.test(ua)) return "Pinterest"
  if (/MicroMessenger/i.test(ua)) return "WeChat"
  if (/Line\//i.test(ua)) return "Line"

  return "this app"
}

/**
 * Gets the URL to open in external browser
 */
export function getExternalBrowserUrl() {
  if (typeof window === "undefined") return ""
  return window.location.href
}

/**
 * Detects if the device is iOS
 */
export function isIOS() {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Detects if the device is Android
 */
export function isAndroid() {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

/**
 * Opens the current page in an external browser (Chrome/Safari)
 * Uses platform-specific deep links to escape WebView
 */
export function openInExternalBrowser(url) {
  if (typeof window === "undefined") return false

  const targetUrl = url || window.location.href

  // Try Android Intent for Chrome
  if (isAndroid()) {
    // Intent URL to open in Chrome
    const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
    window.location.href = intentUrl

    // Fallback: try generic browser intent after a short delay
    setTimeout(() => {
      window.location.href = `intent://${targetUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;action=android.intent.action.VIEW;end`
    }, 500)

    return true
  }

  // iOS: Try to open in Safari
  if (isIOS()) {
    // Use x-safari-https scheme (works in some WebViews)
    window.location.href = `x-safari-${targetUrl}`

    // Fallback: try window.open with _blank
    setTimeout(() => {
      window.open(targetUrl, "_blank")
    }, 500)

    return true
  }

  // Generic fallback: try window.open
  window.open(targetUrl, "_system")
  return true
}

/**
 * Attempts to redirect to external browser automatically
 * Returns true if redirect was attempted
 */
export function redirectToExternalBrowser() {
  if (!isWebView()) return false

  const currentUrl = window.location.href
  openInExternalBrowser(currentUrl)
  return true
}
