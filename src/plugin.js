import { getWeather } from "./utils/weather.js"
import { searchengine } from "./utils/lists.js"
import { timeInHex } from "./utils/timeManager.js"
import { runClock } from "./_main.js"

import moment from 'moment/min/moment-with-locales'

runClock()

chrome.storage.local.get({
  language: "",
  custombg: "",
  customfont: "",
  customfontgoogle: false,
  engines: "google",
  wkey: "",
  w3hours: false,
  tempc: true,
  hexbg: false,
  showSettings: true,
  customcss: ""
}, function(items) {
  let backgroundElement = document.getElementById('js-bg')

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

  document.addEventListener('DOMContentLoaded', () => {
    backgroundElement.src = new_background
  }, false)

  if (items.language) { moment.locale(items.language) }

  if (items.wkey) {
    navigator.geolocation.getCurrentPosition(function(position) {
      getWeather(items, position)
    })
  }

  if (items.customfont) {
    let addFont = '"' + items.customfont + '", "Lato", sans-serif, Arial'
    if (items.customfontgoogle) {
      let gFont = document.createElement("link")
      gFont.href = "https://fonts.googleapis.com/css?family=" + items.customfont.replace(" ", "+")
      gFont.rel = "stylesheet"
      document.head.appendChild(gFont)
    }
    document.body.style.fontFamily = addFont
  }

  if (items.hexbg) {
    backgroundElement.src = ""
    timeInHex()
  }

  if (items.engines !== "google") {
    if (items.engines == "none") {
      document.getElementById('formsearch').style.display = "none"
    }
    document.getElementById('formsearch').action = searchengine[items.engines].url
    document.getElementById('forminput').placeholder = searchengine[items.engines].holder
  }

  if (items.customcss) {
    let cssEl = document.createElement("style")
    cssEl.type = "text/css"
    cssEl.innerText = items.customcss
    document.head.appendChild(cssEl)
  }

  if (items.showSettings) {
    let settings = document.getElementById('settings')
    settings.removeAttribute('style')
    settings.addEventListener('click', function () {
      chrome.runtime.openOptionsPage()
    })
  }
})
