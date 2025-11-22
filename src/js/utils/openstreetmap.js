import leaflet from "leaflet"
import { http } from "./http"

export class WorldMap {
  constructor() {
    // Default values
    this.lat = 20
    this.lon = 0

    this.map = null
    this.marker = null
  }

  /**
   * Create a map and set the initial view
   * @param {string} targetId - The ID of the HTML element to contain the map
   * @param {number} lat - Latitude for the initial view
   * @param {number} lon - Longitude for the initial view
   */
  createMap(targetId, lat, lon) {
    this.lat = lat
    this.lon = lon

    this.map = leaflet.map(
      targetId,
      {
        preferCanvas: true,
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      }
    )
    this.map.setView([this.lat, this.lon], 3)
    leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map)
    this.marker = leaflet.marker([this.lat, this.lon], {
      icon: leaflet.icon({
        iconUrl: "images/icons/marker_icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    }).addTo(this.map)
  }

  /**
   * Set the marker position on the map
   * @param {number} lat - Latitude for the marker
   * @param {number} lon - Longitude for the marker
   */
  setMarker(lat, lon) {
    this.lat = lat
    this.lon = lon
    this.marker.setLatLng([lat, lon])
  }

  /**
   * Get the current coordinates of the marker
   * @returns {Object} An object with 'lat' and 'lon' properties
   */
  getCoordinates() {
    return { lat: this.lat, lon: this.lon }
  }
}

/**
 * Reverse geocode using OpenStreetMap Nominatim API.
 * Has a rate limit of 1 request/second.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {function} callback - Callback function to handle the response
 */
export function reverseGeocode(lat, lon, callback) {
  http("GET", `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, (r) => {
    callback(r)
  })
}
