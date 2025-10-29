import moment from "moment/min/moment-with-locales"

let format
try {
  chrome.storage.local.get({
    no_seconds: false
  }, function(items) {
    format = items.no_seconds ? "LT" : "LTS"
  })
} catch (e) {
  console.log("Running on browser, resulting to default values...")
  format = "LTS"
}

function getViewportDimensions () {
  return {
    w: typeof window.innerWidth === "number" ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth,
    h: typeof window.innerHeight === "number" ? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight
  }
}

export function updateDateAndTime() {
  let dateString = moment().format("LL"),
      timeString = moment().format(format)

  document.getElementById("js-date").innerText = dateString
  document.getElementById("js-time").innerText = timeString

  // Request animation frame for next update
  requestAnimationFrame(updateDateAndTime)
}

export function runClock() {
  // Start updating
  moment.locale(navigator.language)
  updateDateAndTime()
}


// Update the background image height and width properties based on the ratio of the viewport and the ratio of the image.
export function handleViewportResize () {
  let d = getViewportDimensions()
  if ((d.w / d.h) < (backgroundElement.width / backgroundElement.height)) {
    backgroundElement.style.width = "auto"
    backgroundElement.style.height = "100%"
  } else {
    backgroundElement.style.width = "100%"
    backgroundElement.style.height = "auto"
  }
}


// HEX Time
function pad(n) { return ("0" + n).slice(-2) }
function getHexTime() {
  let now = new Date()
  let hour = pad(now.getHours())
  let minute = pad(now.getMinutes())
  let second = pad(now.getSeconds())
  return hour.toString() + minute.toString() + second.toString()
}

export function timeInHex() {
  document.body.style.backgroundColor = "#" + getHexTime("hex")
  setTimeout(timeInHex, 50) // Repeat every 0.1 seconds
}
