import { isChrome, isFirefox } from "./utils/browser.js"
import { runClock } from "./utils/timeManager.js"

import moment from "moment/min/moment-with-locales"

runClock()

function turnSwitch(el) {
  if (el.style.display == "none") {
    el.style.display = "block"
  } else {
    el.style.display = "none"
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const backgroundElement = document.getElementById("js-bg")
  const random_bg_num = Math.floor(Math.random() * 31)

  backgroundElement.src = `assets/images/backgrounds/background${random_bg_num}.jpg`
  backgroundElement.onload = () => {
    backgroundElement.style.opacity = 1
  }
})

// Load all languages
const languages = moment.locales()
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

  moment.locale(getLangVal)
}

// Add a nice install button
function enableButton(text, link) {
  const addbutton = document.getElementById("install-button")
  addbutton.style.display = "block"
  addbutton.innerText = text
  addbutton.href = link
}

if (isFirefox) {
  enableButton("Add to Firefox", "https://addons.mozilla.org/addon/alexflipnote-homepage/")
} else if (isChrome) {
  enableButton("Add to Chrome", "https://chrome.google.com/webstore/detail/apilabeffmpplallenlcommnigaafgfb")
}
