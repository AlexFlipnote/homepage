import { http } from "./http.js"
import { translate } from "./i18n.js"
import { reverseGeocode } from "./openstreetmap.js"
import { Cache } from "./cache.js"

class WeatherData {
  constructor(data, lang = "en") {
    this.temprature = data.instant.details.air_temperature
    this.symbol_code = data.next_1_hours.summary.symbol_code
    this.lang = lang
  }

  prettyName() {
    const removeVariant = this.symbol_code.replace("_day", "").replace("_night", "").replace("_polar_night", "")
    return translate(this.lang, `weather.${removeVariant}`).replace(/^\w/, c => c.toUpperCase())
  }
}

export async function getWeather(items, position, lang) {
  const cache = new Cache()
  const pos = position.coords
  const cacheKey = `weatherLocation_${pos.latitude}_${pos.longitude}`

  const wtemp = document.getElementById("wtemp")
  const wname = document.getElementById("wname")

  let completedRequests = 0
  const showWeatherContainer = () => {
    completedRequests++
    if (completedRequests >= 2) {
      document.getElementById("weather-container").style.display = "flex"
    }
  }

  const weatherResponse = await http(
    "GET",
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${pos.latitude}&lon=${pos.longitude}`
  )

  const weatherData = new WeatherData(weatherResponse.properties.timeseries[0].data, lang || "en")
  document.getElementById("wicon").src = `images/weather/${weatherData.symbol_code}.png`
  document.getElementById("wdescription").innerText = weatherData.prettyName()
  if (items.temp_type === "fahrenheit") {
    wtemp.innerText = `${Math.round(weatherData.temprature * (9 / 5) + 32)} °F`
  } else {
    wtemp.innerText = `${Math.round(weatherData.temprature)} °C`
  }
  showWeatherContainer()

  // OpenStreetMap API can be rate limited, so we cache the location name for 1 hour
  const weatherLocation = await cache.get(cacheKey)

  if (weatherLocation) {
    console.log("📦 Cache: Fetched location name from cache")
    wname.innerText = weatherLocation
    showWeatherContainer()
    return
  }

  const geoResponse = await reverseGeocode(pos.latitude, pos.longitude)

  wname.innerText = (
    geoResponse.address.city || geoResponse.address.town ||
    geoResponse.address.village || geoResponse.address.hamlet ||
      "Unknown Location"
  )
  showWeatherContainer()
  cache.set(cacheKey, wname.innerText)

}

