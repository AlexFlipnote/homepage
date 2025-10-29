export const http = function (url, callback) {
  if (!window.XMLHttpRequest) return console.log("This browser does not support requests")
  const request = new XMLHttpRequest()
  request.open("GET", url, true)
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      const json = JSON.parse(this.response)
      if (callback && typeof(callback) === "function") {
        callback(json)
      }
    }
  }
  request.send(null)
}
