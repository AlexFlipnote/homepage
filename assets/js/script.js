// Check browser type
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isFirefox = typeof InstallTrigger !== 'undefined';


// Engine list
searchengine = {
  "none": {"url": "none", "holder": "none"},
  "ddg": {"url": "https://duckduckgo.com", "holder": "Search on DuckDuckGo..."},
  "bing": {"url": "https://www.bing.com/search", "holder": "Search on Bing..."},
  "searx": {"url": "https://searx.owo.cloud", "holder": "Search on OwO searX..."},
  "yahoo": {"url": "https://search.yahoo.com/search", "holder": "Search on Yahoo..."}
}


// Update the displayed date and time on the page.
function updateDateAndTime() {
  var dateString = moment().format('LL'),
  timeString = moment().format('LTS');

  document.getElementById('js-date').innerText = dateString;
  document.getElementById('js-time').innerText = timeString;

  // Request animation frame for next update
  requestAnimationFrame(updateDateAndTime);
}


// Request function
var http = function (url, callback) {
  if (!window.XMLHttpRequest) return console.log("This browser does not support requests");
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Access-Control-Allow-Headers', '*');
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      var json = JSON.parse(this.response);
      if (callback && typeof(callback) === 'function') {
        callback(json);
      }
    }
  };
  request.send(null);
}


// Weather API icons
var wicons = {
    '01d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/2600.png',
    '02d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/26c5.png',
    '03d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/2601.png',
    '04d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f327.png',
    '09d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f327.png',
    '10d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f326.png',
    '11d': 'https://cdn.discordapp.com/attachments/132632676225122304/270190320736534538/emoji.png',
    '13d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f328.png',
    '50d': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f32b.png',
    '01n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f311.png',
    '02n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/26c5.png',
    '03n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/2601.png',
    '04n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f327.png',
    '09n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f327.png',
    '10n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f326.png',
    '11n': 'https://cdn.discordapp.com/attachments/132632676225122304/270190320736534538/emoji.png',
    '13n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f328.png',
    '50n': 'https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/1f32b.png',
}


// Start updating
moment.locale(navigator.language);
updateDateAndTime();


// Get viewport dimensions.
function getViewportDimensions () {
  return {
    w: typeof window.innerWidth === 'number' ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth,
    h: typeof window.innerHeight === 'number' ? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight
  };
}


// Update the background image height and width properties based on the ratio of the viewport and the ratio of the image.
function handleViewportResize () {
  var d = getViewportDimensions();
  if ((d.w / d.h) < (backgroundElement.width / backgroundElement.height)) {
    backgroundElement.style.width = 'auto';
    backgroundElement.style.height = '100%';
  } else {
    backgroundElement.style.width = '100%';
    backgroundElement.style.height = 'auto';
  }
}

// Set background to a random one
var backgroundElement = document.getElementById('js-bg');
var selected = Math.floor(Math.random() * 31);

backgroundElement.onload = function () {
  var d = getViewportDimensions();
  if ((d.w / d.h) < (backgroundElement.width / backgroundElement.height)) {
    backgroundElement.style.width = '100%';
    backgroundElement.style.height = '100%';
  } else {
    backgroundElement.style.width = '100%';
    backgroundElement.style.height = '100%';
  }
  backgroundElement.style.opacity = 1;
}


// Attach listener to update background width and height based on viewport size changes
if (window.addEventListener) window.addEventListener('resize', handleViewportResize, false);
else if (window.attachEvent) window.attachEvent('onresize', handleViewportResize);
else window.onresize = handleViewportResize;


// Add the install button if on chrome/firefox and website
// Also if
window.onload = function() {
  var website = window.location.href.includes("alexflipnote.xyz/homepage");
  var randombg = backgroundElement.src = 'assets/images/backgrounds/background' + selected + '.jpg';

  function enableButton() {
    addbutton = document.getElementById('install-button');
    addbutton.style.display = "block";
  }

  if (website && isFirefox == true) {
    randombg
    enableButton()
    addbutton.innerHTML = "Add to Firefox";
    addbutton.removeAttribute("onclick");
    addbutton.target = "_blank";
    addbutton.href = "https://addons.mozilla.org/addon/alexflipnote-homepage/";
  } else if (website && isChrome == true) {
    randombg
    enableButton()
    addbutton.innerHTML = "Add to Chrome";
  } else if (!website && (isChrome || isFirefox == true)) {
    // Load custom settings
    chrome.storage.local.get({
      custombg: "",
      engines: "google",
      wkey: "",
      tempc: true,
      links: ""
    }, function(items) {
      if (items.custombg.length > 2) {
        var chooseranbg = items.custombg.split("\n");
        var chooseranbgindex = Math.floor(Math.random() * chooseranbg.length);
        backgroundElement.src = chooseranbg[chooseranbgindex];
      } else {
        randombg
      }

      if (items.wkey.length > 2) {
        navigator.geolocation.getCurrentPosition(function(position) {
          pos = position.coords
          var lang = navigator.language.split('-')[0]

          http(`http://api.openweathermap.org/data/2.5/weather?lat=${pos.latitude}&lon=${pos.longitude}&lang=${lang}&APPID=${items.wkey}`, function(r) {
            document.getElementById('wicon').src = wicons[r.weather[0].icon]
            document.getElementById('wname').innerHTML = r.name
            document.getElementById('wdescription').innerHTML = r.weather[0].description.replace(/^\w/, c => c.toUpperCase());
            if (items.temp == false) {
              document.getElementById('wtemp').innerHTML = `${Math.round(parseInt(r.main.temp) * (9 / 5) - 459.67)} °F`
            } else {
              document.getElementById('wtemp').innerHTML = `${Math.round(parseInt(r.main.temp) - 273.15)} °C`
            }

            document.getElementById('wcontainer').style.display = "block";
          })

        });
      }

      if (items.engines !== "google") {
        if (items.engines == "none") {
          document.getElementById('formsearch').style.display = "none";
        }
        document.getElementById('formsearch').action = searchengine[items.engines].url;
        document.getElementById('forminput').placeholder = searchengine[items.engines].holder;
      }

      // Quick links
      if (items.links.length > 2) {
        var links = items.links.split('\n')
        for (var i = 0; i < links.length; i++) {
          (function (lnk) {
            setTimeout(function () {
              var link = document.createElement('a')
              var img = document.createElement('img')
              var txt = document.createElement('span')

              link.classList.add('quicklink')
              link.classList.add('load')
              setTimeout(function () {
                link.classList.remove('load')
              }, 800)
              link.setAttribute('href', lnk)

              img.classList.add('quicklink-icon')
              img.setAttribute('src', 'https://cdn.bowser65.tk/favicon/' + lnk)

              txt.classList.add('quicklink-txt')
              txt.innerText = lnk

              link.appendChild(img)
              link.appendChild(txt)
              document.getElementById('quicklinks').appendChild(link)
            }, i * 500)
          })(links[i])
        }
      }
    })
  }

}
