import { isChrome, isFirefox, isExtension } from "./utils/browser"
import { dateLocales } from "./utils/lists.js"
import { extensionSettings } from "./utils/settings.js"
import { getWeather } from "./utils/weather.js"
import { timeInHex, startClock, changeLocale } from "./utils/timeManager.js"

const DEFAULT = {
  fmt_time: "%H:%M:%S",
  fmt_date: "%d. %B %Y",
}

if (isExtension) {
  // Extension mode
  console.log("☑️ Running in extension mode")

  chrome.storage.local.get({ ...extensionSettings }, function(items) {
    startClock("js-time", items.fmt_time || DEFAULT.fmt_time)
    startClock("js-date", items.fmt_date || DEFAULT.fmt_date)
    changeLocale(items.language)

    const backgroundElement = document.getElementById("js-bg")
    const random_bg_num = Math.floor(Math.random() * 31)
    let new_background = `assets/images/backgrounds/background${random_bg_num}.jpg`

    if (items.custombg.length > 0) {
      new_background = items.custombg[
        Math.floor(Math.random() * items.custombg.length)
      ]
    }

    backgroundElement.onload = () => {
      backgroundElement.style.opacity = 1
    }

    if (items.wkey) {
      navigator.geolocation.getCurrentPosition(function(position) {
        getWeather(items, position, items.wkey, items.wlanguage)
      })
    }

    if (items.bookmarks) {
      document.getElementById("bookmarks").style.display = "block"
      const bookmarksList = document.getElementById("bookmarks_list")
      for (const [name, url] of Object.entries(items.bookmarks)) {
        const listItem = document.createElement("li")
        const link = document.createElement("a")
        link.href = url
        link.textContent = name
        listItem.appendChild(link)
        bookmarksList.appendChild(listItem)
      }
    }

    if (items.customfont) {
      if (items.customfontgoogle) {
        const gFont = document.createElement("link")
        gFont.href = "https://fonts.googleapis.com/css?family=" + items.customfont.replace(" ", "+")
        gFont.rel = "stylesheet"
        document.head.appendChild(gFont)
      }
      document.body.style.fontFamily = `"${items.customfont}", "Lato", sans-serif, Arial`
    }

    if (items.hexbg) {
      backgroundElement.src = ""
      timeInHex()
    } else {
      backgroundElement.src = new_background
    }

    if (items.customcss) {
      const cssEl = document.createElement("style")
      cssEl.type = "text/css"
      cssEl.innerText = items.customcss
      document.head.appendChild(cssEl)
    }

    if (items.showSettings) {
      const settings = document.getElementById("settings")
      settings.removeAttribute("style")
    }
  })

} else {
  console.log("ℹ️ Running in demo mode")
  // Demo mode
  startClock("js-time", DEFAULT.fmt_time)
  startClock("js-date", DEFAULT.fmt_date)

  function turnSwitch(el) {
    if (el.style.display == "none") {
      el.style.display = "block"
    } else {
      el.style.display = "none"
    }
  }

  turnSwitch(document.getElementById("demoButtons"))

  document.addEventListener("DOMContentLoaded", function() {
    const backgroundElement = document.getElementById("js-bg")
    const random_bg_num = Math.floor(Math.random() * 31)

    backgroundElement.src = `assets/images/backgrounds/background${random_bg_num}.jpg`
    backgroundElement.onload = () => {
      backgroundElement.style.opacity = 1
    }
  })

  // Load all languages
  const languages = Object.keys(dateLocales).sort()
  for (let i = 0; i < languages.length; i++) {
    const option = document.createElement("option")
    option.text = languages[i]
    option.value = languages[i]
    document.getElementById("language").appendChild(option)
  }


  // Change background
  document.getElementById("changebg").onclick = function() {
    const font = prompt("Please enter a font", "Times New Roman")
    if (font) {
      document.body.style.fontFamily = `"${font}", "Lato", sans-serif, Arial`
    }
  }

  // Change background
  document.getElementById("changefont").onclick = function() {
    const backgroundElement = document.getElementById("js-bg")
    const bg = prompt("Please enter a background URL:", "https://")
    if (bg) { backgroundElement.src = bg }
  }

  // Turn on/off weather
  document.getElementById("weather").onclick = function() {
    turnSwitch(document.getElementById("wcontainer"))
  }

  // Change language
  document.getElementById("language").onchange = function(el) {
    let getLangVal = document.getElementById("language").value
    if (!getLangVal) { getLangVal = navigator.language }

    changeLocale(getLangVal)
  }

  // Add a nice install button
  function downloadButton(text, link) {
    const addbutton = document.getElementById("install-button")
    addbutton.style.display = "block"
    addbutton.innerText = text
    addbutton.href = link
    if (link === "#") addbutton.onclick = () => { return false }
  }

  if (isFirefox) {
    downloadButton("Add to Firefox", "https://addons.mozilla.org/addon/alexflipnote-homepage/")
  } else if (isChrome) {
    downloadButton("Add to Chrome", "https://chromewebstore.google.com/detail/alexflipnotehomepage/npagigfpfilcemncemkphndcaigegcbk")
  }

}

