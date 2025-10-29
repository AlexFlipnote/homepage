import { http } from "./http.js"
import { wicons } from "./lists.js"


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
