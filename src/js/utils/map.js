import leaflet from "leaflet"

export class WorldMap {
  constructor() {
    // Default values
    this.lat = 20
    this.lon = 0

    this.map = null
    this.marker = null
  }

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

  setMarker(lat, lon) {
    this.lat = lat
    this.lon = lon
    this.marker.setLatLng([lat, lon])
  }

  getCoordinates() {
    return { lat: this.lat, lon: this.lon }
  }
}
