export const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
export const isFirefox = typeof InstallTrigger !== "undefined"
export const isExtension = /^(?:chrome|moz)-extension:$/.test(location.protocol)

/**
 * Get the browser name
 * @returns {string} The browser name: "chrome", "firefox", "safari", "edge", "opera", or "browser"
 */
export function getBrowser() {
  // Thanks Bowser65 xd
  if (navigator.userAgent.includes("Edg/")) { return "edge" }
  const match = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)
  return (match ? match[1] : "browser").toLowerCase()
}
