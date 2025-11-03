import { isChrome, isFirefox, isExtension } from "./utils/browser"
import { dateLocales } from "./utils/lists.js"
import { extensionSettings } from "./utils/settings.js"
import { getWeather } from "./utils/weather.js"
import { timeInHex, startClock, changeLocale } from "./utils/timeManager.js"
import * as manifest from "../manifest.json"

const DEFAULT = {
  fmt_time: "%H:%M:%S",
  fmt_date: "%e. %B %Y",
}

function faviconURL(u) {
  return chrome.runtime.getURL(
    `/_favicon/?pageUrl=${u}&size=32`
  )
}

function createBookmark(
  el, name, url,
  {
    bookmarksFavicon = false,
    isAuto = false,
    localFavicon = ""
  } = {}
) {
  const container = document.createElement("a")
  container.href = url

  if (isAuto) {
    container.setAttribute("data-auto", "true")
  }

  if (!isFirefox && bookmarksFavicon) {
    const bIcon = document.createElement("img")
    bIcon.src = faviconURL(url)
    bIcon.className = "bookmark-icon"
    container.appendChild(bIcon)
  }

  if (localFavicon.length > 0) {
    const bIcon = document.createElement("img")
    bIcon.src = localFavicon
    bIcon.className = "bookmark-icon"
    container.appendChild(bIcon)
  }

  const bName = document.createElement("span")
  bName.textContent = name
  container.appendChild(bName)

  el.appendChild(container)
}

if (isExtension) {
  // Extension mode
  console.log(`☑️ Running in extension mode (v${manifest.version})`)

  document.getElementById("search-form").onsubmit = (e) => {
    e.preventDefault()
    chrome.search.query({
      text: document.getElementById("search-input").value
    })
  }

  chrome.storage.local.get({ ...extensionSettings }, function(items) {
    startClock("time", items.fmt_time || DEFAULT.fmt_time)
    startClock("date", items.fmt_date || DEFAULT.fmt_date)
    changeLocale(items.language)

    const backgroundElement = document.getElementById("background")
    const random_bg_num = Math.floor(Math.random() * 31)
    let new_background = `images/backgrounds/background${random_bg_num}.jpg`

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

    const bookmarks = document.getElementById("bookmarks")

    if (items.bookmarks) {
      bookmarks.style.display = "flex"
      items.bookmarks.forEach(({ name, url }) => {
        createBookmark(bookmarks, name, url, {
          bookmarksFavicon: items.bookmarksFavicon
        })
      })
    }

    if (items.searchbar) {
      const searchForm = document.getElementById("search-form")
      searchForm.style.display = "block"
    }

    if (items.bookmarksTopSitesEnabled) {
      bookmarks.style.display = "flex"
      chrome.topSites.get((sites) => {
        console.log(sites)
        console.log(items.bookmarksTopSitesAmount)
        for (const { title, url } of sites.slice(0, items.bookmarksTopSitesAmount)) {
          createBookmark(bookmarks, title, url, {
            bookmarksFavicon: items.bookmarksFavicon,
            isAuto: true
          })
        }
      })
    }

    if (items.customfont) {
      if (items.customfontgoogle) {
        const gFont = document.createElement("link")
        gFont.href = `https://fonts.googleapis.com/css?family=${items.customfont.replace(" ", "+")}`
        gFont.rel = "stylesheet"
        document.head.appendChild(gFont)
      }
      document.body.style.fontFamily = `"${items.customfont}"`
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
  startClock("time", DEFAULT.fmt_time)
  startClock("date", DEFAULT.fmt_date)

  // Create some boiler plate bookmarks
  const bookmarksList = document.getElementById("bookmarks")
  createBookmark(bookmarksList, "Github", "https://github.com/AlexFlipnote/homepage", {
    localFavicon: "images/icons/github.png"
  })
  createBookmark(bookmarksList, "Discord", "https://discord.gg/yqb7vATbjH", {
    localFavicon: "images/icons/discord.png"
  })

  function turnSwitch(el, display="block") {
    if (el.style.display == "none") {
      el.style.display = display
    } else {
      el.style.display = "none"
    }
  }

  turnSwitch(document.getElementById("demo-buttons"))

  document.addEventListener("DOMContentLoaded", function() {
    const backgroundElement = document.getElementById("background")
    const random_bg_num = Math.floor(Math.random() * 31)

    backgroundElement.src = `images/backgrounds/background${random_bg_num}.jpg`
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

  // Toggle bookmarks
  document.getElementById("bookmarksToggle").onclick = function() {
    turnSwitch(document.getElementById("bookmarks"), "flex")
  }

  // Toggle search bar
  document.getElementById("searchToggle").onclick = function() {
    turnSwitch(document.getElementById("search-form"), "block")
  }

  document.getElementById("search-form").onsubmit = (e) => {
    e.preventDefault()
    alert(`This would then search using the browser's default search engine`)
  }

  // Change background
  document.getElementById("changefont").onclick = function() {
    const backgroundElement = document.getElementById("background")
    const bg = prompt("Please enter a background URL:", "https://")
    if (bg) { backgroundElement.src = bg }
  }

  // Turn on/off weather
  document.getElementById("weather").onclick = function() {
    turnSwitch(document.getElementById("weather-container"), "flex")
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

