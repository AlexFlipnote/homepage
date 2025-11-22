import * as manifest from "../manifest.json"
import Sortable from "sortablejs"

import { extensionSettings } from "./utils/settings.js"
import { isFirefox } from "./utils/browser.js"
import { WorldMap } from "./utils/openstreetmap.js"
import { HexClock } from "./utils/timeManager.js"
import { availableLanguages } from "./utils/i18n.js"

const findVersion = document.getElementById("version")
if (findVersion) {
  findVersion.textContent = manifest.version
}

const userMap = new WorldMap()

function createAlert(message, css="") {
  const notification = document.getElementById("notification")
  const alert = document.createElement("div")
  alert.classList.add("alert")
  if (css) { alert.classList.add(css) }
  alert.textContent = message || "Options saved"
  notification.appendChild(alert)
  setTimeout(() => { alert.remove() }, 3000)
}

// Saves options to chrome.storage
function saveOptions(message, css="") {
  const custombg = []
  const custombgPreviews = document.getElementsByClassName("preview-image")
  for (var i = 0; i < custombgPreviews.length; i++) { custombg.push(custombgPreviews[i].src) }

  chrome.storage.local.set({
    language: document.getElementById("language").value,
    custombg: custombg,
    show_time: document.getElementById("show_time").checked,
    show_date: document.getElementById("show_date").checked,
    fmt_time: document.getElementById("fmt_time").value,
    searchbar: document.getElementById("searchbar").checked,
    fmt_date: document.getElementById("fmt_date").value,
    customfont: document.getElementById("customfont").value,
    customfontgoogle: document.getElementById("customfontgoogle").checked,
    wEnable: document.getElementById("wEnable").checked,
    wlat: userMap.marker ? userMap.marker.getLatLng().lat : 0,
    wlon: userMap.marker ? userMap.marker.getLatLng().lng : 0,
    wManualLocation: document.getElementById("wManualLocation").checked,
    hexbg: document.getElementById("hexbg").checked,
    temp_type: document.getElementById("temp_type").value,
    showSettings: document.getElementById("show-settings").checked,
    bookmarksFavicon: document.getElementById("bookmarksFavicon").checked,
    bookmarksTopSitesEnabled: document.getElementById("bookmarksTopSitesEnabled").checked,
    bookmarksTopSitesAmount: parseInt(document.getElementById("bookmarksTopSitesAmount").value) || 5,
    customcss: document.getElementById("customcss").value,
    bookmarks: fetchBookmarkInputs()
  }, () => {
    createAlert(message, css)
  })
}

function createMapInit(items) {
  const getMap = document.getElementById("map")
  getMap.style.display = "block"

  try {
    userMap.createMap("map", items.wlat, items.wlon)
  } catch {
    return // Ignore error
  }

  userMap.map.on("click", (e) => {
    const { lat, lng } = e.latlng
    userMap.setMarker(lat, lng)
    const wlat = document.getElementById("wlat")
    const wlon = document.getElementById("wlon")
    wlat.textContent = lat.toFixed(4)
    wlon.textContent = lng.toFixed(4)
    saveOptions(`Weather location set: Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`, "change")
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.local.get({ ...extensionSettings }, (items) => {
    const language = document.getElementById("language")
    language.value = items.language
    language.onchange = () => { saveOptions(`Language changed: ${language.value || "default"}`, "change") }

    const showTime = document.getElementById("show_time")
    showTime.checked = items.show_time
    showTime.onchange = () => { saveOptions(`Show time set: ${showTime.checked}`, showTime.checked ? "add" : "remove") }

    const showDate = document.getElementById("show_date")
    showDate.checked = items.show_date
    showDate.onchange = () => { saveOptions(`Show date set: ${showDate.checked}`, showDate.checked ? "add" : "remove") }

    const searchbar = document.getElementById("searchbar")
    searchbar.checked = items.searchbar
    searchbar.onchange = () => { saveOptions(`Search bar set: ${searchbar.checked}`, searchbar.checked ? "add" : "remove") }

    const wManualLocation = document.getElementById("wManualLocation")
    wManualLocation.checked = items.wManualLocation
    wManualLocation.onchange = () => {
      saveOptions(`Weather manual location set: ${wManualLocation.checked}`, wManualLocation.checked ? "add" : "remove")

      if (wManualLocation.checked) {
        createMapInit(items)
      } else {
        document.getElementById("map").style.display = "none"
      }
    }

    if (items.wManualLocation) {
      createMapInit(items)
    }

    const wlat = document.getElementById("wlat")
    const wlon = document.getElementById("wlon")
    wlat.textContent = items.wlat.toFixed(4) || "0.0000"
    wlon.textContent = items.wlon.toFixed(4) || "0.0000"

    const fmtTime = document.getElementById("fmt_time")
    fmtTime.value = items.fmt_time
    fmtTime.onchange = () => { saveOptions(`Time format set: ${fmtTime.value || "default"}`, fmtTime.value ? "change" : "remove") }

    const fmtDate = document.getElementById("fmt_date")
    fmtDate.value = items.fmt_date
    fmtDate.onchange = () => { saveOptions(`Date format set: ${fmtDate.value || "default"}`, fmtDate.value ? "change" : "remove") }

    const customfont = document.getElementById("customfont")
    customfont.value = items.customfont
    customfont.onchange = () => { saveOptions(`Custom font set: ${customfont.value || "default"}`, customfont.value ? "change" : "remove") }

    const customfontgoogle = document.getElementById("customfontgoogle")
    customfontgoogle.checked = items.customfontgoogle
    customfontgoogle.onchange = () => { saveOptions(`Google font set: ${customfontgoogle.checked}`, customfontgoogle.checked ? "add" : "remove") }

    const hexbg = document.getElementById("hexbg")
    hexbg.checked = items.hexbg
    hexbg.onchange = () => { saveOptions(`HEX background set: ${hexbg.checked}`, hexbg.checked ? "add" : "remove") }

    const wEnable = document.getElementById("wEnable")
    wEnable.checked = items.wEnable
    wEnable.onchange = () => { saveOptions(`Set weather: ${wEnable.checked}`, wEnable.checked ? "add" : "remove") }

    const tempType = document.getElementById("temp_type")
    tempType.value = items.temp_type
    tempType.onchange = () => { saveOptions(`Weather temperature type changed: ${tempType.value}`, "change") }

    const showSettings = document.getElementById("show-settings")
    showSettings.checked = items.showSettings
    showSettings.onchange = () => { saveOptions(`Show settings button set: ${showSettings.checked}`, showSettings.checked ? "add" : "remove") }

    const customcss = document.getElementById("customcss")
    customcss.value = items.customcss
    customcss.onchange = () => { saveOptions("Custom CSS changed") }

    const bookmarksTopSitesEnabled = document.getElementById("bookmarksTopSitesEnabled")
    bookmarksTopSitesEnabled.checked = items.bookmarksTopSitesEnabled
    bookmarksTopSitesEnabled.onchange = () => { saveOptions(`Bookmarks top sites set: ${bookmarksTopSitesEnabled.checked}`, bookmarksTopSitesEnabled.checked ? "add" : "remove") }

    const bookmarksTopSitesAmount = document.getElementById("bookmarksTopSitesAmount")
    bookmarksTopSitesAmount.value = items.bookmarksTopSitesAmount
    bookmarksTopSitesAmount.onchange = () => { saveOptions(`Bookmarks top sites amount set: ${bookmarksTopSitesAmount.value}`, "change") }

    const bookmarksFavicon = document.getElementById("bookmarksFavicon")
    bookmarksFavicon.checked = items.bookmarksFavicon
    bookmarksFavicon.onchange = () => { saveOptions(`Bookmarks favicon set: ${bookmarksFavicon.checked}`, bookmarksFavicon.checked ? "add" : "remove") }

    if (isFirefox) {
      document.getElementById("bmFavFirefox").style.display = "none"
    }

    items.bookmarks.forEach(({ name, url }) => {
      createBookmarkElement(name, url)
    })

    const allPreviews = document.getElementById("custombg_previews")
    for (var i = 0; i < items.custombg.length; i++) {
      createPreview(items.custombg[i], allPreviews)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const languages = document.getElementById("language")
  for (const [k, v] of Object.entries(availableLanguages({hideDefault: true}))) {
    const option = document.createElement("option")
    option.text = v
    option.value = k
    languages.appendChild(option)
  }

  // Show live demo
  new HexClock(document.getElementById("hexbgdemobg"), {background:true}).start()
  new HexClock(document.getElementById("hexbgdemotext"), {text:true}).start()

  new Sortable(document.getElementById("blist"), {
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: ".drag",
    onEnd: () => {
      saveOptions("Reordered bookmarks", "change")
    }
  })
})

// CustomBG Appender
document.getElementById("custombg_uploader").onchange = () => {
  const allPreviews = document.getElementById("custombg_previews")

  const files = document.getElementById("custombg_uploader").files

  if (!files.length) { return }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()

    reader.addEventListener("load", () => {
      const mbLimit = 1.5
      const imageSizeMB = (reader.result.length * (3/4)) / (1024 * 1024)
      if (imageSizeMB > mbLimit) {
        createAlert(`Image is larger than ${mbLimit}MB and will not be uploaded.`, "remove")
      } else {
        createPreview(reader.result, allPreviews)
        saveOptions("Added background image", "add")
      }
    }, false)

    reader.readAsDataURL(file)
  }

  // When done, reset the input so the same file can be uploaded again if wanted
  document.getElementById("custombg_uploader").value = ""
}

document.getElementById("add_bookmark").onclick = () => {
  createBookmarkElement(
    document.getElementById("bookmark_name").value || "New Bookmark",
    document.getElementById("bookmark_url").value || "#"
  )
  document.getElementById("bookmark_name").value = ""
  document.getElementById("bookmark_url").value = ""
  saveOptions("Added new bookmark")
}

// CustomBG Remover
document.body.onclick = function (ev) {
  if (ev.target.getAttribute("class") == "preview-image") {
    ev.target.remove()
    saveOptions("Removed background image", "remove")
  }
}

function custombgPrune() {
  const custombgPreviews = document.getElementById("custombg_previews")
  const findCustomBg = custombgPreviews.getElementsByClassName("preview-container")
  if (findCustomBg.length == 0) { return }

  while (findCustomBg.length > 0) {
    findCustomBg[0].remove()
  }

  saveOptions("Deleted all background images", "remove")
}

function createPreview(image, target) {
  const container = document.createElement("div")
  container.classList.add("preview-container")

  const preview = document.createElement("img")
  preview.classList.add("preview-image")
  preview.src = image

  container.append(preview) // div -> img

  const fileContainer = target.querySelector(".file-container")
  fileContainer.before(container)
}

function createBookmarkElement(bkey, burl) {
  const blist = document.getElementById("blist")
  const container = document.createElement("div")
  container.classList.add("bookmark-item")

  const dragIcon = document.createElement("img")
  dragIcon.src = "images/icons/drag.png"
  dragIcon.classList.add("drag")

  const nameInput = document.createElement("input")
  nameInput.type = "text"
  nameInput.value = bkey
  nameInput.classList.add("bookmark-name")

  const urlInput = document.createElement("input")
  urlInput.type = "text"
  urlInput.value = burl
  urlInput.classList.add("bookmark-url")

  const removeButton = document.createElement("img")
  removeButton.src = "images/icons/delete.png"
  removeButton.classList.add("remove")
  removeButton.onclick = function() {
    container.remove()
    saveOptions("Removed bookmark", "remove")
  }

  container.appendChild(dragIcon)
  container.appendChild(nameInput)
  container.appendChild(urlInput)
  container.appendChild(removeButton)

  nameInput.onchange = () => { saveOptions("Changed bookmark name", "change") }
  urlInput.onchange = () => { saveOptions("Changed bookmark URL", "change") }

  blist.appendChild(container)
}

function fetchBookmarkInputs() {
  const blist = document.getElementById("blist")
  const bookmarkItems = blist.getElementsByClassName("bookmark-item")
  const bookmarks = []

  for (var i = 0; i < bookmarkItems.length; i++) {
    const bmEl = bookmarkItems[i]
    const name = bmEl.getElementsByClassName("bookmark-name")[0].value
    const url = bmEl.getElementsByClassName("bookmark-url")[0].value || "#"
    bookmarks.push({ name: name, url: url })
  }

  return bookmarks
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.getElementById("custombg_prune").addEventListener("click", custombgPrune)
