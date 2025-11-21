import * as enGb from "../i18n/en-GB.json"
import * as noNb from "../i18n/no-NB.json"
import * as esEs from "../i18n/es-ES.json"

const DEFAULT_LANG = "en-GB"

export const translations = {
  "en-GB": enGb,
  "no-NB": noNb,
  "es-ES": esEs
}

export function translate(lang, key) {
  const language = translations[lang] || translations[DEFAULT_LANG]
  return language[key] || translations[DEFAULT_LANG][key] || key
}

export function availableLanguages() {
  const langs = {}
  for (const code in translations) {
    langs[code] = translations[code]["language.name"] || code
  }
  return langs
}
