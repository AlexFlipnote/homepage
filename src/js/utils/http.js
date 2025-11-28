import manifest from "../../manifest.json"

/**
 * Make an HTTP request, returning the response as JSON.
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - The URL to send the request to
 * @returns {Promise<any>} - The response data as JSON
 */
export async function http(method, url) {
  if (!window.fetch) return console.error("This browser does not support requests")

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      // The only reason I use X-* headers is because some browsers refuse to set custom "unsafe headers"
      "X-Referer": "https://alexflipnote.dev/homepage",
      "X-User-Agent": `AlexFlipnoteHomepage/${manifest.version}`
    }
  })

  if (!response.ok) {
    console.error(`HTTP-Error: ${response.status}`, await response.text())
    return
  }

  return await response.json()
}
