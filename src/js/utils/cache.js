export class Cache {
  constructor(rootKey = "cache") {
    this.rootKey = rootKey
  }

  /**
   * Retrieve the entire cache object from storage
   * @returns {Object} The cache object
   */
  async _getStore() {
    const result = await chrome.storage.local.get(this.rootKey)
    return result[this.rootKey] || {}
  }

  /**
   * Get a value inside the cache object
   * @param {string} key - The sub-key (e.g., 'profile')
   * @returns {any} The cached data or null if not found/expired
   */
  async get(key) {
    const store = await this._getStore()
    const item = store[key]

    if (!item) return null

    const now = Date.now()

    if (item.expiry && now > item.expiry) {
      await this.delete(key)
      return null
    }

    return item.value
  }

  /**
   * Set a value inside the cache object
   * @param {string} key - The sub-key (e.g., 'profile')
   * @param {any} value - The data
   * @param {number} ttlMinutes - Time to live in minutes (optional)
   * @returns {any} The stored value
   */
  async set(key, value, ttlMinutes = 60) {
    const store = await this._getStore()

    const now = Date.now()
    const expiry = now + (ttlMinutes * 60 * 1000)

    store[key] = {
      value: value,
      expiry: expiry
    }

    await chrome.storage.local.set({ [this.rootKey]: store })
    return value
  }

  /**
   * Delete a value inside the cache object
   * @param {string} key - The sub-key (e.g., 'profile')
   */
  async delete(key) {
    const store = await this._getStore()

    if (key in store) {
      delete store[key]
      await chrome.storage.local.set({ [this.rootKey]: store })
    }
  }

  /**
   * Clear the entire cache object
   */
  async flush() {
    await chrome.storage.local.remove(this.rootKey)
  }
}
