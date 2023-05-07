import { updateDateAndTime } from "./utils/timeManager.js"
import moment from 'moment/min/moment-with-locales'

export function runClock() {
  // Start updating
  moment.locale(navigator.language)
  updateDateAndTime()
}
