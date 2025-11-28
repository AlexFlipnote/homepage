import { isFirefox, isExtension } from "./utils/browser"
import { extensionSettings } from "./utils/settings.js"
import { getWeather } from "./utils/weather.js"
import { HexClock, Clock } from "./utils/timeManager.js"
import { availableLanguages, setLocale, translate, getLocale } from "./utils/i18n.js"
import * as manifest from "../manifest.json"

const DEFAULT = {
  backgroundImagesCount: 31
}

function faviconURL(u) {
  return chrome.runtime.getURL(
    `/_favicon/?pageUrl=${u}&size=32`
  )
}

class ManualPosition {
  constructor(lat, lon) {
    this.coords = {
      latitude: lat,
      longitude: lon
    }
  }
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
    // Start by setting language
    setLocale(items.language)
    const defaultTime = translate(items.language, "time.format.default")
    const defaultDate = translate(items.language, "date.format.default")

    if (items.show_time) {
      new Clock("time", items.fmt_time || defaultTime).start()
    }

    if (items.show_date) {
      new Clock("date", items.fmt_date || defaultDate).start()
    }

    const backgroundElement = document.getElementById("background")
    const randomBgNum = Math.floor(Math.random() * DEFAULT.backgroundImagesCount)
    let newBackground = `images/backgrounds/background${randomBgNum}.jpg`

    if (items.custombg.length > 0) {
      newBackground = items.custombg[
        Math.floor(Math.random() * items.custombg.length)
      ]
    }

    backgroundElement.onload = () => {
      backgroundElement.style.opacity = 1
    }

    if (items.wEnable) {
      if (items.wManualLocation) {
        const position = new ManualPosition(items.wlat, items.wlon)
        getWeather(items, position, items.language)
      } else {
        navigator.geolocation.getCurrentPosition((position) => {
          getWeather(items, position, items.language)
        })
      }
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
      const searchInput = document.getElementById("search-input")
      searchInput.placeholder = translate(items.language, "search.placeholder")
      searchForm.style.display = "block"
    }

    if (items.bookmarksTopSitesEnabled) {
      bookmarks.style.display = "flex"
      chrome.topSites.get((sites) => {
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
      new HexClock(document.body, {background: true}).start()
    } else {
      backgroundElement.src = newBackground
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

  const wname = document.getElementById("wname")
  const wdescription = document.getElementById("wdescription")
  wname.textContent = translate(undefined, "demo.weather.location")
  wdescription.textContent = translate(undefined, "demo.weather.condition")

  const timeClock = new Clock("time", translate(undefined, "time.format.default"))
  timeClock.start()

  const dateClock = new Clock("date", translate(undefined, "date.format.default"))
  dateClock.start()

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

  turnSwitch(document.getElementById("demo-buttons"), "flex")

  document.addEventListener("DOMContentLoaded", function() {
    const backgroundElement = document.getElementById("background")
    const randomBgNum = Math.floor(Math.random() * DEFAULT.backgroundImagesCount)

    backgroundElement.src = `images/backgrounds/background${randomBgNum}.jpg`
    backgroundElement.onload = () => {
      backgroundElement.style.opacity = 1
    }
  })

  // Load all languages
  for (const [k, v] of Object.entries(availableLanguages({ hideDefault: true }))) {
    const option = document.createElement("option")
    option.text = v
    option.value = k
    document.getElementById("language").appendChild(option)
  }

  // Toggle time
  document.getElementById("timeToggle").onclick = () => {
    turnSwitch(document.getElementById("time"), "block")
  }

  // Toggle date
  document.getElementById("dateToggle").onclick = () => {
    turnSwitch(document.getElementById("date"), "block")
  }

  // Change background
  document.getElementById("changebg").onchange = (el) => {
    const backgroundElement = document.getElementById("background")
    if (el.target.value) {
      backgroundElement.src = el.target.value
    }
    else {
      backgroundElement.src = null
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
    alert("This would then search using the browser's default search engine")
  }

  // Change background
  document.getElementById("changefont").onchange = (el) => {
    const font = el.target.value
    if (font) {
      document.body.style.fontFamily = `"${font}"`
    } else {
      document.body.style.fontFamily = ""
    }
  }

  // Change clock format
  document.getElementById("changeClock").onchange = (el) => {
    const format = el.target.value
    if (format) {
      timeClock.changeFormat(format)
    } else {
      timeClock.changeFormat(translate(getLocale(), "time.format.default"))
    }
  }

  // Change date format
  document.getElementById("changeDate").onchange = (el) => {
    const format = el.target.value
    if (format) {
      dateClock.changeFormat(format)
    } else {
      dateClock.changeFormat(translate(getLocale(), "date.format.default"))
    }
  }

  // Turn on/off weather
  document.getElementById("weather").onclick = () => {
    turnSwitch(document.getElementById("weather-container"), "flex")
  }

  // Add a nice install button
  function downloadButton(language=undefined) {
    let browser = "Chrome"
    let link = "https://chromewebstore.google.com/detail/alexflipnotehomepage/npagigfpfilcemncemkphndcaigegcbk"

    if (isFirefox) {
      browser = "Firefox"
      link = "https://addons.mozilla.org/addon/alexflipnote-homepage/"
    }

    const addbutton = document.getElementById("install-button")
    addbutton.style.display = "block"
    addbutton.innerText = translate(language, "demo.install", {browser: browser})
    addbutton.href = link
    if (link === "#") addbutton.onclick = () => { return false }
  }

  downloadButton()

  // Change language
  document.getElementById("language").onchange = () => {
    let getLangVal = document.getElementById("language").value
    if (!getLangVal) { getLangVal = navigator.language }

    setLocale(getLangVal)
    timeClock.changeFormat(translate(getLangVal, "time.format.default"))
    dateClock.changeFormat(translate(getLangVal, "date.format.default"))

    const searchInput = document.getElementById("search-input")
    searchInput.placeholder = translate(getLangVal, "search.placeholder")

    wname.textContent = translate(getLangVal, "demo.weather.location")
    wdescription.textContent = translate(getLangVal, "demo.weather.condition")

    downloadButton(getLangVal)
  }
}

