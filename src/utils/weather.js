import { http } from "./http.js"
import { wicons } from "./lists.js"

import moment from "moment/min/moment-with-locales"

export function showWeatherLanguages() {
  return {
    "sq": "Albanian",
    "af": "Afrikaans",
    "ar": "Arabic",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "zh_cn": "Chinese Simplified",
    "zh_tw": "Chinese Traditional",
    "hr": "Croatian",
    "cz": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "fi": "Finnish",
    "fr": "French",
    "gl": "Galician",
    "de": "German",
    "el": "Greek",
    "he": "Hebrew",
    "hi": "Hindi",
    "hu": "Hungarian",
    "is": "Icelandic",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "kr": "Korean",
    "ku": "Kurmanji (Kurdish)",
    "la": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "no": "Norwegian",
    "fa": "Persian (Farsi)",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt_br": "Português Brasil",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "es": "Spanish",
    "se": "Swedish",
    "th": "Thai",
    "tr": "Turkish",
    "ua": "Ukrainian",
    "vi": "Vietnamese",
    "zu": "Zulu",
  }
}

export function getWeather(items, position, wkey, lang) {
  let pos = position.coords
  let wlang = lang || "en"
  http(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.latitude}&lon=${pos.longitude}&appid=${wkey}&lang=${wlang}`, (r) => {
    document.getElementById("wicon").src = "assets/images/weather/" + wicons[r.weather[0].icon]
    document.getElementById("wname").innerText = r.name
    document.getElementById("wdescription").innerText = r.weather[0].description.replace(/^\w/, c => c.toUpperCase())
    if (items.tempc == false) {
      document.getElementById("wtemp").innerText = `${Math.round(parseInt(r.main.temp) * (9 / 5) - 459.67)} °F`
    } else {
      document.getElementById("wtemp").innerText = `${Math.round(parseInt(r.main.temp) - 273.15)} °C`
    }

    document.getElementById("wcontainer").style.display = "block"
  })
}
