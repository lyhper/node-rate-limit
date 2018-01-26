'use strict'

class MemoryCache {
  constructor () {
    // 存储数据
    this.store = {}
    // 存储延时id
    this.timeoutIdMap = {}
  }
  /**
   * 设置缓存值
   */
  set () {
    const key = arguments[0]
    const value = arguments[1]
    const delay = arguments[3]

    return new Promise((resolve, reject) => {
      this.store[key] = value

      if (delay) {
        this._expire(key, delay)
      } else {
        // 未设置过期时间时，移除掉过期时间，与redis保持一致
        this._removeExpire(key)
      }

      resolve(value)
    })
  }
  /**
   * 获取缓存值
   */
  get (key) {
    return new Promise((resolve, reject) => {
      resolve(this.store[key])
    })
  }
  /**
   * 缓存值加1
   */
  incr (key) {
    return new Promise((resolve, reject) => {
      let val = this.store[key] || 0

      if (typeof val === 'number') {
        this.store[key] = ++val
        resolve(val)
        return
      }

      if (!isNaN(+val)) {
        val = +val + 1
        this.store[key] = val
        resolve(val)
        return
      }

      reject('操作的值必须为数字')
    })
  }
  /**
   * 指定时间后清除key值
   * @param {string} key
   * @param {number} delay 延迟时间，单位秒
   */
  _expire (key, delay) {
    this._removeExpire(key)

    const timeoutId = setTimeout(() => {
      // 删除值
      delete this.store[key]
      // 删除延迟id
      delete this.timeoutIdMap[key]
    }, delay * 1000)

    this.timeoutIdMap[key] = timeoutId
  }

  /**
   * 移除key值过期时间
   */
  _removeExpire (key) {
    if (this.timeoutIdMap[key]) {
      clearTimeout(this.timeoutIdMap[key])
      delete this.timeoutIdMap[key]
    }
  }
}

module.exports = MemoryCache