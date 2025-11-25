import enGb from "@i18n/en-GB.json"
import noNb from "@i18n/no-NB.json"
import esEs from "@i18n/es-ES.json"
import frFr from "@i18n/fr-FR.json"
import ptPt from "@i18n/pt-PT.json"

export const DEFAULT_LANG = "en-GB"
export let SELECTED_LANG = DEFAULT_LANG

/** Set the current language
 * @param {string} lang - Language code (e.g., 'en-GB')
 */
export function setLocale(lang) {
  SELECTED_LANG = lang || DEFAULT_LANG
}

/** Get the currently selected language
 * @returns {string} Language code (e.g., 'en-GB')
 */
export function getLocale() {
  return SELECTED_LANG
}

/**
 * Translations object containing all language data
 */
export const translations = {
  "en-GB": enGb,
  "no-NB": noNb,
  "es-ES": esEs,
  "fr-FR": frFr,
  "pt-PT": ptPt
}

/**
 * Translate a key into the selected language
 * @param {string} lang - Language code (e.g., 'en-GB')
 * @param {string} key - Translation key (e.g., 'greeting.hello')
 * @param {Object} args - Optional arguments for placeholders
 * @returns {string} Translated string
 */
export function translate(lang, key, args = {}) {
  const language = translations[lang] || translations[DEFAULT_LANG]
  let translation = language[key] || translations[DEFAULT_LANG][key] || key

  // Replace placeholders with provided arguments
  Object.keys(args).forEach(placeholder => {
    const regex = new RegExp("{" + placeholder + "}", "g")
    translation = translation.replace(regex, args[placeholder])
  })

  return translation
}

/**
 * Get a list of available languages with their native names
 * @param {boolean} hideDefault - Whether to hide the default language from the list
 * @returns {Object} Object with language codes as keys and native names as values
 */
export function availableLanguages({ hideDefault = false } = {}) {
  const langs = {}
  for (const code in translations) {
    if (hideDefault && code === DEFAULT_LANG) continue
    langs[code] = translations[code]["language.name"] || code
  }
  return langs
}
