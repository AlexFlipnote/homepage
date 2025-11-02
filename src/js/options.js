import { isFirefox } from "./utils/browser.js"
import { weatherLanguages, dateLocales } from "./utils/lists.js"
import { extensionSettings } from "./utils/settings.js"
import * as manifest from "../manifest.json"

const findVersion = document.getElementById("version")
if (findVersion) {
  findVersion.textContent = manifest.version
}

// Saves options to chrome.storage
function save_options(message) {
  const language = document.getElementById("language").value
  const wlanguage = document.getElementById("wlanguage").value
  const customfont = document.getElementById("customfont").value
  const fmt_time = document.getElementById("fmt_time").value
  const fmt_date = document.getElementById("fmt_date").value
  const customfontgoogle = document.getElementById("customfontgoogle").checked
  const hexbg = document.getElementById("hexbg").checked
  const wkey = document.getElementById("wkey").value
  const temp_type = document.getElementById("temp_type").value
  const showSettings = document.getElementById("show-settings").checked
  const customcss = document.getElementById("customcss").value
  const bookmarksTopSitesEnabled = document.getElementById("bookmarksTopSitesEnabled").checked
  const bookmarksTopSitesAmount = parseInt(document.getElementById("bookmarksTopSitesAmount").value) || 5
  const bookmarksFavicon = document.getElementById("bookmarksFavicon").checked

  const custombg = []
  const custombg_previews = document.getElementsByClassName("preview-image")

  const bookmarks = fetchBookmarkInputs()

  for (var i = 0; i < custombg_previews.length; i++) {
    custombg.push(custombg_previews[i].src)
  }

  chrome.storage.local.set({
    language: language,
    wlanguage: wlanguage,
    custombg: custombg,
    fmt_time: fmt_time,
    fmt_date: fmt_date,
    customfont: customfont,
    customfontgoogle: customfontgoogle,
    wkey: wkey,
    hexbg: hexbg,
    temp_type: temp_type,
    showSettings: showSettings,
    bookmarksFavicon: bookmarksFavicon,
    bookmarksTopSitesEnabled: bookmarksTopSitesEnabled,
    bookmarksTopSitesAmount: bookmarksTopSitesAmount,
    customcss: customcss,
    bookmarks: bookmarks
  }, () => {
    const notification = document.getElementById("notification")
    const alert = document.createElement("div")
    alert.classList.add("alert")
    alert.textContent = message || "Options saved"
    notification.appendChild(alert)
    setTimeout(() => { alert.remove() }, 3000)
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({ ...extensionSettings }, (items) => {
    const language = document.getElementById("language")
    language.value = items.language
    language.onchange = () => { save_options(`Language set: ${language.value || "default"}`) }

    const wlanguage = document.getElementById("wlanguage")
    wlanguage.value = items.wlanguage
    wlanguage.onchange = () => { save_options(`Weather language set: ${wlanguage.value || "default"}`) }

    const fmt_time = document.getElementById("fmt_time")
    fmt_time.value = items.fmt_time
    fmt_time.onchange = () => { save_options(`Time format set: ${fmt_time.value || "default"}`) }

    const fmt_date = document.getElementById("fmt_date")
    fmt_date.value = items.fmt_date
    fmt_date.onchange = () => { save_options(`Date format set: ${fmt_date.value || "default"}`) }

    const customfont = document.getElementById("customfont")
    customfont.value = items.customfont
    customfont.onchange = () => { save_options(`Custom font set: ${customfont.value || "default"}`) }

    const customfontgoogle = document.getElementById("customfontgoogle")
    customfontgoogle.checked = items.customfontgoogle
    customfontgoogle.onchange = () => { save_options(`Google font set: ${customfontgoogle.checked}`) }

    const hexbg = document.getElementById("hexbg")
    hexbg.checked = items.hexbg
    hexbg.onchange = () => { save_options(`HEX background set: ${hexbg.checked}`) }

    const wkey = document.getElementById("wkey")
    wkey.value = items.wkey
    wkey.onchange = () => { save_options("Saved OpenWeatherMap API key") }

    const temp_type = document.getElementById("temp_type")
    temp_type.value = items.temp_type
    temp_type.onchange = () => { save_options(`Weather temperature type set: ${temp_type.value}`) }

    const showSettings = document.getElementById("show-settings")
    showSettings.checked = items.showSettings
    showSettings.onchange = () => { save_options(`Show settings button set: ${showSettings.checked}`) }

    const customcss = document.getElementById("customcss")
    customcss.value = items.customcss
    customcss.onchange = () => { save_options("Custom CSS changed") }

    const bookmarksTopSitesEnabled = document.getElementById("bookmarksTopSitesEnabled")
    bookmarksTopSitesEnabled.checked = items.bookmarksTopSitesEnabled
    bookmarksTopSitesEnabled.onchange = () => { save_options(`Bookmarks top sites set: ${bookmarksTopSitesEnabled.checked}`) }

    const bookmarksTopSitesAmount = document.getElementById("bookmarksTopSitesAmount")
    bookmarksTopSitesAmount.value = items.bookmarksTopSitesAmount
    bookmarksTopSitesAmount.onchange = () => { save_options(`Bookmarks top sites amount set: ${bookmarksTopSitesAmount.value}`) }

    const bookmarksFavicon = document.getElementById("bookmarksFavicon")
    bookmarksFavicon.checked = items.bookmarksFavicon
    bookmarksFavicon.onchange = () => { save_options(`Bookmarks favicon set: ${bookmarksFavicon.checked}`) }

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

  // Weather languages
  const wlanguage = document.getElementById("wlanguage")
  for (const [code, name] of Object.entries(weatherLanguages)) {
    const option = document.createElement("option")
    option.text = name
    option.value = code
    wlanguage.appendChild(option)
  }
})

// CustomBG Appender
document.getElementById("custombg_uploader").onchange  = () => {
  const all_previews = document.getElementById("custombg_previews")
  const file = document.querySelector("input[type=file]").files[0]
  const reader = new FileReader()

  reader.addEventListener("load", function () {
    createPreview(reader.result, all_previews)
    save_options("Added new background image")
  }, false)

  if (file) { reader.readAsDataURL(file) }
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
    save_options("Removed background image")
  }
}

function custombg_prune() {
  const custombg_previews = document.getElementById("custombg_previews")
  while (custombg_previews.firstChild) {
    custombg_previews.removeChild(custombg_previews.firstChild);
  }
}

function createPreview(image, target) {
  const container = document.createElement("div")
  container.classList.add("preview-container")

  const preview = document.createElement("img")
  preview.classList.add("preview-image")
  preview.src = image

  container.append(preview) // div -> img
  target.append(container) // div
}

function createBookmarkElement(bkey, burl) {
  const blist = document.getElementById("blist")
  const container = document.createElement("div")
  container.classList.add("bookmark-item")

  const nameInput = document.createElement("input")
  const urlInput = document.createElement("input")
  const removeButton = document.createElement("button")
  nameInput.type = "text"
  nameInput.value = bkey
  nameInput.classList.add("bookmark-name")
  urlInput.type = "text"
  urlInput.value = burl
  urlInput.classList.add("bookmark-url")
  removeButton.textContent = "Remove"
  removeButton.onclick = function() {
    container.remove()
    save_options("Removed bookmark")
  }
  container.appendChild(nameInput)
  container.appendChild(urlInput)
  container.appendChild(removeButton)

  nameInput.onchange = () => { save_options("Changed bookmark name") }
  urlInput.onchange = () => { save_options("Changed bookmark URL") }

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
