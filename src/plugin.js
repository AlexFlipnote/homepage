import { getWeather } from "./utils/weather.js"
import { timeInHex } from "./utils/timeManager.js"
import { runClock } from "./_main.js"

import moment from "moment/min/moment-with-locales"

runClock()

chrome.storage.local.get({
  language: "",
  wlanguage: "",
  custombg: "",
  customfont: "",
  customfontgoogle: false,
  wkey: "",
  tempc: true,
  hexbg: false,
  showSettings: true,
  customcss: ""
}, function(items) {
  let backgroundElement = document.getElementById("js-bg")

  const random_bg_num = Math.floor(Math.random() * 31)
  let new_background = `assets/images/backgrounds/background${random_bg_num}.jpg`

  if (items.custombg.length) {
    new_background = items.custombg[
      Math.floor(Math.random() * items.custombg.length)
    ]
  }

  backgroundElement.onload = () => {
    backgroundElement.style.opacity = 1
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!items.hexbg) { backgroundElement.src = new_background }
  }, false)

  if (items.language) { moment.locale(items.language) }

  if (items.wkey) {
    navigator.geolocation.getCurrentPosition(function(position) {
      getWeather(items, position, items.wkey, items.wlanguage)
    })
  }

  if (items.customfont) {
    if (items.customfontgoogle) {
      let gFont = document.createElement("link")
      gFont.href = "https://fonts.googleapis.com/css?family=" + items.customfont.replace(" ", "+")
      gFont.rel = "stylesheet"
      document.head.appendChild(gFont)
    }
    document.body.style.fontFamily = `"${items.customfont}", "Lato", sans-serif, Arial`
  }

  if (items.hexbg) {
    backgroundElement.src = ""
    timeInHex()
  }

  if (items.customcss) {
    let cssEl = document.createElement("style")
    cssEl.type = "text/css"
    cssEl.innerText = items.customcss
    document.head.appendChild(cssEl)
  }

  if (items.showSettings) {
    let settings = document.getElementById("settings")
    settings.removeAttribute("style")
  }
})
