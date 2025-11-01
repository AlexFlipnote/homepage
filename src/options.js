import { weatherLanguages, dateLocales } from "./utils/lists.js"
import { extensionSettings } from "./utils/settings.js"

// Saves options to chrome.storage
function save_options() {
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
    customcss: customcss,
    bookmarks: bookmarks
  }, () => {
    // Update status to let user know options were saved.
    const modal = document.getElementById("modal")
    const modaltarget = document.getElementsByClassName("modal")[0]
    modal.style.display = "flex"
    modaltarget.classList.remove("modal--close")
    setTimeout(function() {
      modaltarget.classList.add("modal--close")
      setTimeout(function() { modal.style.display = "none" }, 570)
    }, 1000)
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({ ...extensionSettings }, (items) => {
    document.getElementById("language").value = items.language
    document.getElementById("wlanguage").value = items.wlanguage
    document.getElementById("fmt_time").value = items.fmt_time
    document.getElementById("fmt_date").value = items.fmt_date
    document.getElementById("customfont").value = items.customfont
    document.getElementById("customfontgoogle").checked = items.customfontgoogle
    document.getElementById("hexbg").checked = items.hexbg
    document.getElementById("wkey").value = items.wkey
    document.getElementById("temp_type").value = items.temp_type
    document.getElementById("show-settings").checked = items.showSettings
    document.getElementById("customcss").value = items.customcss

    for (const [bkey, burl] of Object.entries(items.bookmarks)) {
      createBookmarkElement(bkey, burl)
    }

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
}

// CustomBG Remover
document.body.onclick = function (ev) {
  if (ev.target.getAttribute("class") == "preview-image") {
    ev.target.remove()
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
  const bookmarks_list = document.getElementById("bookmarks_list")
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
  }
  container.appendChild(nameInput)
  container.appendChild(urlInput)
  container.appendChild(removeButton)

  bookmarks_list.appendChild(container)
}

function fetchBookmarkInputs() {
  const bookmarks_list = document.getElementById("bookmarks_list")
  const bookmarkItems = bookmarks_list.getElementsByClassName("bookmark-item")
  const bookmarks = {}

  for (var i = 0; i < bookmarkItems.length; i++) {
    const bm_el = bookmarkItems[i]
    const name = bm_el.getElementsByClassName("bookmark-name")[0].value
    const url = bm_el.getElementsByClassName("bookmark-url")[0].value || "#"
    bookmarks[name] = url
  }

  return bookmarks
}

document.addEventListener("DOMContentLoaded", restore_options)
document.getElementById("custombg_prune").addEventListener("click", custombg_prune)
document.getElementById("save").addEventListener("click", save_options)
