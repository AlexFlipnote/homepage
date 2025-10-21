export const http = function (url, callback) {
  if (!window.XMLHttpRequest) return console.log("This browser does not support requests")
  const request = new XMLHttpRequest()
  request.open('GET', url, true)
  request.setRequestHeader('User-Agent', 'AlexFlipnote:Homepage/2 github.com/AlexFlipnote/homepage')
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      let json = JSON.parse(this.response)
      if (callback && typeof(callback) === 'function') {
        callback(json)
      }
    }
  }
  request.send(null)
}
