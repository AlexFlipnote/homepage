import * as enGb from "@i18n/en-GB.json"
import * as noNb from "@i18n/no-NB.json"
import * as esEs from "@i18n/es-ES.json"

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
  "es-ES": esEs
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
 * @returns {Object} Object with language codes as keys and native names as values
 */
export function availableLanguages() {
  const langs = {}
  for (const code in translations) {
    langs[code] = translations[code]["language.name"] || code
  }
  return langs
}
