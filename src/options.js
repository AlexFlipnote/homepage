import moment from 'moment/min/moment-with-locales'

// Saves options to chrome.storage
function save_options() {
  let language = document.getElementById('language').value
  let customfont = document.getElementById('customfont').value
  let customfontgoogle = document.getElementById('customfontgoogle').checked
  let no_seconds = document.getElementById('no_seconds').checked
  let hexbg = document.getElementById('hexbg').checked
  let engines = document.getElementById('engines').value
  let wkey = document.getElementById('wkey').value
  let w3hours = document.getElementById('w3hours').checked
  let tempc = document.getElementById('tempc').checked
  let showSettings = document.getElementById('show-settings').checked
  let customcss = document.getElementById('customcss').value

  let custombg = []
  let custombg_previews = document.getElementsByClassName("preview-image")

  for (var i = 0; i < custombg_previews.length; i++) {
    custombg.push(custombg_previews[i].src)
  }

  chrome.storage.local.set({
    language: language,
    custombg: custombg,
    customfont: customfont,
    no_seconds: no_seconds,
    customfontgoogle: customfontgoogle,
    engines: engines,
    wkey: wkey,
    w3hours: w3hours,
    hexbg: hexbg,
    tempc: tempc,
    showSettings: showSettings,
    customcss: customcss
  }, function() {
    // Update status to let user know options were saved.
    let modal = document.getElementById('modal')
    let modaltarget = document.getElementsByClassName('modal')[0]
    modal.style.display = "flex"
    modaltarget.classList.remove('modal--close')
    setTimeout(function() {
      modaltarget.classList.add('modal--close')
      setTimeout(function() { modal.style.display = "none" }, 570)
    }, 1000)
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    language: "",
    custombg: [],
    customfont: "",
    no_seconds: false,
    customfontgoogle: false,
    engines: "google",
    wkey: "",
    w3hours: false,
    tempc: true,
    hexbg: false,
    showSettings: true,
    customcss: ""
  }, function(items) {
    document.getElementById('language').value = items.language
    document.getElementById('customfont').value = items.customfont
    document.getElementById('no_seconds').checked = items.no_seconds
    document.getElementById('customfontgoogle').checked = items.customfontgoogle
    document.getElementById('hexbg').checked = items.hexbg
    document.getElementById('engines').value = items.engines
    document.getElementById('wkey').value = items.wkey
    document.getElementById('w3hours').checked = items.w3hours
    document.getElementById('tempc').checked = items.tempc
    document.getElementById('show-settings').checked = items.showSettings
    document.getElementById('quicklink-limit').innerText = Math.floor((window.innerHeight - 65) / 40).toString()
    document.getElementById('customcss').value = items.customcss

    let all_previews = document.getElementById("custombg_previews")
    for (var i = 0; i < items.custombg.length; i++) {
      createPreview(items.custombg[i], all_previews)
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  // Clock languages
  const languages = moment.locales()
  for (var i = 0; i < languages.length; i++) {
    let option = document.createElement("option")
    option.text = languages[i]
    option.value = languages[i]
    document.getElementById("language").appendChild(option)
  }
})

// CustomBG Appender
document.getElementById('custombg_uploader').onchange = function() {
  let all_previews = document.getElementById("custombg_previews")
  let file = document.querySelector('input[type=file]').files[0]
  let reader = new FileReader()

  reader.addEventListener("load", function () {
    createPreview(reader.result, all_previews)
  }, false)

  if (file) { reader.readAsDataURL(file) }
}

// CustomBG Remover
document.body.onclick = function (ev) {
  if (ev.target.getAttribute("class") == "preview-image") {
    ev.target.remove()
  }
}

function custombg_prune() {
  let custombg_previews = document.getElementById("custombg_previews")
  while (custombg_previews.firstChild) {
    custombg_previews.removeChild(custombg_previews.firstChild);
  }
}

function createPreview(image, target) {
  let container = document.createElement("div")
  container.classList.add("preview-container")

  let preview = document.createElement("img")
  preview.classList.add("preview-image")
  preview.src = image

  container.append(preview) // div -> img
  target.append(container) // div
}

document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('custombg_prune').addEventListener('click', custombg_prune)
document.getElementById('save').addEventListener('click', save_options)
