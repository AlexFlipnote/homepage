import { http } from "./http.js"
import { wicons } from "./lists.js"

import moment from 'moment/min/moment-with-locales'

function newWeatherTime(target, items, data) {
  let element = document.createElement("div")
  let wlIcon = document.createElement("img")
  let wlText = document.createElement("p")
  element.className = "wdiff"
  wlText.className = "text"
  wlIcon.className = "icon"

  let getTemp
  if (items.tempc == false) {
    getTemp = `${Math.round(parseInt(data.main.temp) * (9 / 5) - 459.67)} °F`
  } else {
    getTemp = `${Math.round(parseInt(data.main.temp) - 273.15)} °C`
  }

  wlIcon.src = "assets/images/weather/" + wicons[data.weather[0].icon]
  let getTime = moment.unix(data.dt).format("LT")
  let getDesc = data.weather[0].description.replace(/^\w/, c => c.toUpperCase())
  wlText.innerText = `${getTime} - `

  let wlTextDetail = document.createElement("span")
  wlTextDetail.innerText = `${getDesc} | ${getTemp}`
  wlTextDetail.classList.add("wdetails")
  wlText.append(wlTextDetail)

  element.appendChild(wlIcon)
  element.appendChild(wlText)
  target.appendChild(element)
}

export function getWeather(items, position) {
  let pos = position.coords
  http(`https://api.met.no/weatherapi/locationforecast/2.0/complete.json?lat=${pos.latitude}&lon=${pos.longitude}`, (r) => {
    document.getElementById('wicon').src = "assets/images/weather/" + wicons[r.list[0].weather[0].icon]
    document.getElementById('wname').innerText = r.city.name
    document.getElementById('wdescription').innerText = r.list[0].weather[0].description.replace(/^\w/, c => c.toUpperCase())
    if (items.tempc == false) {
      document.getElementById('wtemp').innerText = `${Math.round(parseInt(r.list[0].main.temp) * (9 / 5) - 459.67)} °F`
    } else {
      document.getElementById('wtemp').innerText = `${Math.round(parseInt(r.list[0].main.temp) - 273.15)} °C`
    }

    document.getElementById('wcontainer').style.display = "block"

    // Make all the other time differences if enabled
    let wLater = document.getElementById('wtime-container')
    if (items.w3hours) {
      for (var i = 1; i < 5; i++) {
        newWeatherTime(wLater, items, r.list[i])
      }
    }
  })
}
