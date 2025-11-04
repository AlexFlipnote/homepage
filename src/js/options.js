import * as manifest from "../manifest.json"
import Sortable from "sortablejs"
import { extensionSettings } from "./utils/settings.js"
import { isFirefox } from "./utils/browser.js"
import { startHexClock } from "./utils/timeManager.js"
import { weatherLanguages, dateLocales } from "./utils/lists.js"

const findVersion = document.getElementById("version")
if (findVersion) {
  findVersion.textContent = manifest.version
}

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
function save_options(message, css="") {
  const custombg = []
  const custombg_previews = document.getElementsByClassName("preview-image")
  for (var i = 0; i < custombg_previews.length; i++) { custombg.push(custombg_previews[i].src) }

  chrome.storage.local.set({
    language: document.getElementById("language").value,
    wlanguage: document.getElementById("wlanguage").value,
    custombg: custombg,
    fmt_time: document.getElementById("fmt_time").value,
    searchbar: document.getElementById("searchbar").checked,
    fmt_date: document.getElementById("fmt_date").value,
    customfont: document.getElementById("customfont").value,
    customfontgoogle: document.getElementById("customfontgoogle").checked,
    wkey: document.getElementById("wkey").value,
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({ ...extensionSettings }, (items) => {
    const language = document.getElementById("language")
    language.value = items.language
    language.onchange = () => { save_options(`Language changed: ${language.value || "default"}`, "change") }

    const searchbar = document.getElementById("searchbar")
    searchbar.checked = items.searchbar
    searchbar.onchange = () => { save_options(`Search bar set: ${searchbar.checked}`, searchbar.checked ? "add" : "remove") }

    const wlanguage = document.getElementById("wlanguage")
    wlanguage.value = items.wlanguage
    wlanguage.onchange = () => { save_options(`Weather language set: ${wlanguage.value || "default"}`, wlanguage.value ? "change" : "remove") }

    const fmt_time = document.getElementById("fmt_time")
    fmt_time.value = items.fmt_time
    fmt_time.onchange = () => { save_options(`Time format set: ${fmt_time.value || "default"}`, fmt_time.value ? "change" : "remove") }

    const fmt_date = document.getElementById("fmt_date")
    fmt_date.value = items.fmt_date
    fmt_date.onchange = () => { save_options(`Date format set: ${fmt_date.value || "default"}`, fmt_date.value ? "change" : "remove") }

    const customfont = document.getElementById("customfont")
    customfont.value = items.customfont
    customfont.onchange = () => { save_options(`Custom font set: ${customfont.value || "default"}`, customfont.value ? "change" : "remove") }

    const customfontgoogle = document.getElementById("customfontgoogle")
    customfontgoogle.checked = items.customfontgoogle
    customfontgoogle.onchange = () => { save_options(`Google font set: ${customfontgoogle.checked}`, customfontgoogle.checked ? "add" : "remove") }

    const hexbg = document.getElementById("hexbg")
    hexbg.checked = items.hexbg
    hexbg.onchange = () => { save_options(`HEX background set: ${hexbg.checked}`, hexbg.checked ? "add" : "remove") }

    const wkey = document.getElementById("wkey")
    wkey.value = items.wkey
    wkey.onchange = () => { save_options("Saved OpenWeatherMap API key", wkey.value.length ? "add" : "remove") }

    const temp_type = document.getElementById("temp_type")
    temp_type.value = items.temp_type
    temp_type.onchange = () => { save_options(`Weather temperature type changed: ${temp_type.value}`, "change") }

    const showSettings = document.getElementById("show-settings")
    showSettings.checked = items.showSettings
    showSettings.onchange = () => { save_options(`Show settings button set: ${showSettings.checked}`, showSettings.checked ? "add" : "remove") }

    const customcss = document.getElementById("customcss")
    customcss.value = items.customcss
    customcss.onchange = () => { save_options("Custom CSS changed") }

    const bookmarksTopSitesEnabled = document.getElementById("bookmarksTopSitesEnabled")
    bookmarksTopSitesEnabled.checked = items.bookmarksTopSitesEnabled
    bookmarksTopSitesEnabled.onchange = () => { save_options(`Bookmarks top sites set: ${bookmarksTopSitesEnabled.checked}`, bookmarksTopSitesEnabled.checked ? "add" : "remove") }

    const bookmarksTopSitesAmount = document.getElementById("bookmarksTopSitesAmount")
    bookmarksTopSitesAmount.value = items.bookmarksTopSitesAmount
    bookmarksTopSitesAmount.onchange = () => { save_options(`Bookmarks top sites amount set: ${bookmarksTopSitesAmount.value}`, "change") }

    const bookmarksFavicon = document.getElementById("bookmarksFavicon")
    bookmarksFavicon.checked = items.bookmarksFavicon
    bookmarksFavicon.onchange = () => { save_options(`Bookmarks favicon set: ${bookmarksFavicon.checked}`, bookmarksFavicon.checked ? "add" : "remove") }

    if (isFirefox) {
      document.getElementById("bmFavFirefox").style.display = "none"
    }

    items.bookmarks.forEach(({ name, url }) => {
      createBookmarkElement(name, url)
    })

    const all_previews = document.getElementById("custombg_previews")
    for (var i = 0; i < items.custombg.length; i++) {
      createPreview(items.custombg[i], all_previews)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const languages = document.getElementById("language")
  for (const [k, v] of Object.entries(dateLocales)) {
    const option = document.createElement("option")
    option.text = v
    option.value = k
    languages.appendChild(option)
  }

  // Show live demo
  startHexClock(document.getElementById("hexbgdemobg"), {background:true})
  startHexClock(document.getElementById("hexbgdemotext"), {text:true})

  // Weather languages
  const wlanguage = document.getElementById("wlanguage")
  for (const [code, name] of Object.entries(weatherLanguages)) {
    const option = document.createElement("option")
    option.text = name
    option.value = code
    wlanguage.appendChild(option)
  }

  new Sortable(document.getElementById("blist"), {
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: ".drag",
    onEnd: () => {
      save_options("Reordered bookmarks", "change")
    }
  })
})

// CustomBG Appender
document.getElementById("custombg_uploader").onchange = () => {
  const all_previews = document.getElementById("custombg_previews")

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
        createPreview(reader.result, all_previews)
        save_options("Added background image", "add")
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
  save_options("Added new bookmark")
}

// CustomBG Remover
document.body.onclick = function (ev) {
  if (ev.target.getAttribute("class") == "preview-image") {
    ev.target.remove()
    save_options("Removed background image", "remove")
  }
}

function custombg_prune() {
  const custombg_previews = document.getElementById("custombg_previews")
  const find_custom_bg = custombg_previews.getElementsByClassName("preview-container")
  if (find_custom_bg.length == 0) { return }

  while (find_custom_bg.length > 0) {
    find_custom_bg[0].remove()
  }

  save_options("Deleted all background images", "remove")
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
    save_options("Removed bookmark", "remove")
  }

  container.appendChild(dragIcon)
  container.appendChild(nameInput)
  container.appendChild(urlInput)
  container.appendChild(removeButton)

  nameInput.onchange = () => { save_options("Changed bookmark name", "change") }
  urlInput.onchange = () => { save_options("Changed bookmark URL", "change") }

  blist.appendChild(container)
}

function fetchBookmarkInputs() {
  const blist = document.getElementById("blist")
  const bookmarkItems = blist.getElementsByClassName("bookmark-item")
  const bookmarks = []

  for (var i = 0; i < bookmarkItems.length; i++) {
    const bm_el = bookmarkItems[i]
    const name = bm_el.getElementsByClassName("bookmark-name")[0].value
    const url = bm_el.getElementsByClassName("bookmark-url")[0].value || "#"
    bookmarks.push({ name: name, url: url })
  }

  return bookmarks
}

document.addEventListener("DOMContentLoaded", restore_options)
document.getElementById("custombg_prune").addEventListener("click", custombg_prune)
