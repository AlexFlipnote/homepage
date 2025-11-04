let clockLocale = navigator.language || "en-US"

export function compileStrftime(fmt) {
  const pad2 = n => (n < 10 ? "0" + n : "" + n)
  const pad3 = n => (n < 10 ? "00" + n : n < 100 ? "0" + n : "" + n)
  const padSpace2 = n => (n < 10 ? " " + n : "" + n)

  const intlCache = {
    monthLong: new Map(),
    monthShort: new Map(),
    weekdayLong: new Map(),
    weekdayShort: new Map(),
    dayPeriod: new Map()
  }

  function fmtPartsForMonth(localeKey, options) {
    const map = options.length === "short" ? intlCache.monthShort : intlCache.monthLong
    if (!map.has(localeKey)) {
      map.set(localeKey, new Intl.DateTimeFormat(localeKey, { month: options.length }))
    }
    const dtf = map.get(localeKey)
    return monthIndex => {
      return dtf.format(new Date(2000, monthIndex, 1))
    }
  }

  function fmtPartsForWeekday(localeKey, options) {
    const map = options.length === "short" ? intlCache.weekdayShort : intlCache.weekdayLong
    if (!map.has(localeKey)) {
      map.set(localeKey, new Intl.DateTimeFormat(localeKey, { weekday: options.length }))
    }
    const dtf = map.get(localeKey)
    return weekdayIndex => dtf.format(new Date(2020, 0, 5 + weekdayIndex))
  }

  function fmtDayPeriod(localeKey) {
    if (!intlCache.dayPeriod.has(localeKey)) {
      const dtf = new Intl.DateTimeFormat(localeKey, { hour: "numeric", hour12: true })
      intlCache.dayPeriod.set(localeKey, dtf)
    }
    const dtf = intlCache.dayPeriod.get(localeKey)
    return hour => {
      const parts = dtf.formatToParts(new Date(2020, 0, 1, hour))
      const p = parts.find(x => x.type === "dayPeriod")
      return p ? p.value : (hour < 12 ? "AM" : "PM")
    }
  }

  function tokenFactory(token, localeKey) {
    switch (token) {
      case "%Y": return d => String(d.getFullYear())
      case "%y": return d => pad2(d.getFullYear() % 100)

      case "%m": return d => pad2(d.getMonth() + 1)
      case "%B": {
        const getMonth = fmtPartsForMonth(localeKey || undefined, { length: "long" })
        return d => getMonth(d.getMonth())
      }
      case "%b": {
        const getMonth = fmtPartsForMonth(localeKey || undefined, { length: "short" })
        return d => getMonth(d.getMonth())
      }

      case "%d": return d => pad2(d.getDate())
      case "%e": return d => padSpace2(d.getDate())
      case "%j": return d => {
        const start = new Date(d.getFullYear(), 0, 1)
        const diff = d - start
        return pad3(Math.floor(diff / 86400000) + 1)
      }

      case "%A": {
        const getDay = fmtPartsForWeekday(localeKey || undefined, { length: "long" })
        return d => getDay(d.getDay())
      }
      case "%a": {
        const getDay = fmtPartsForWeekday(localeKey || undefined, { length: "short" })
        return d => getDay(d.getDay())
      }
      case "%w": return d => String(d.getDay())

      case "%H": return d => pad2(d.getHours())
      case "%I": return d => {
        const h = d.getHours() % 12
        return pad2(h === 0 ? 12 : h)
      }
      case "%p": {
        const getPeriod = fmtDayPeriod(localeKey || undefined)
        return d => getPeriod(d.getHours())
      }

      case "%M": return d => pad2(d.getMinutes())
      case "%S": return d => pad2(d.getSeconds())
      case "%f": return d => String(d.getMilliseconds()).padStart(3, "0")

      case "%z": return d => {
        const off = -d.getTimezoneOffset()
        const sign = off >= 0 ? "+" : "-"
        const abs = Math.abs(off)
        const hh = pad2(Math.floor(abs / 60))
        const mm = pad2(abs % 60)
        return sign + hh + mm
      }
      case "%Z": return d => {
        try {
          const parts = new Intl.DateTimeFormat(localeKey || undefined, { timeZoneName: "short" }).formatToParts(d)
          const t = parts.find(p => p.type === "timeZoneName")
          return t ? t.value : tokenFactory("%z")(d)
        } catch {
          return tokenFactory("%z")(d)
        }
      }

      case "%F": return d => `${tokenFactory('%Y')(d)}-${tokenFactory('%m')(d)}-${tokenFactory('%d')(d)}`
      case "%T": return d => `${tokenFactory('%H')(d)}:${tokenFactory('%M')(d)}:${tokenFactory('%S')(d)}`
      case "%%": return () => "%"

      default:
        return () => token
    }
  }

  const parts = []
  const regex = /%[A-Za-z%]/g
  let lastIndex = 0
  let m

  while ((m = regex.exec(fmt)) !== null) {
    const idx = m.index
    if (idx > lastIndex) {
      parts.push(fmt.slice(lastIndex, idx))
    }
    const token = m[0]
    parts.push(tokenFactory(token, clockLocale))
    lastIndex = idx + token.length
  }
  if (lastIndex < fmt.length) parts.push(fmt.slice(lastIndex))

  return function formatDate(date = new Date()) {
    if (!(date instanceof Date)) date = new Date(date)
    const o = []
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (typeof p === "string") o.push(p)
      else o.push(p(date))
    }
    return o.join("")
  }
}

export function changeLocale(newLocale) {
  clockLocale = newLocale || navigator.language || "en-US"
}

// HEX Time
export function timeInHex() {
  function pad(n) { return ("0" + n).slice(-2) }
  let now = new Date()
  let hour = pad(now.getHours())
  let minute = pad(now.getMinutes())
  let second = pad(now.getSeconds())
  return `${hour}${minute}${second}`
}

export function startClock(docId, format) {
  const fmt = compileStrftime(format)
  document.getElementById(docId).textContent = fmt(new Date())
  requestAnimationFrame(() => startClock(docId, format))
}

export function startHexClock(el, {background=false, color=false, text=false}={}) {
  if (background) el.style.backgroundColor = `#${timeInHex()}`
  if (color) el.style.color = `#${timeInHex()}`
  if (text) el.textContent = `#${timeInHex()}`
  requestAnimationFrame(() => startHexClock(el, {background, color, text}))
}
