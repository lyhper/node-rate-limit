'use strict'
/**
 * 对同一ip限制访问频率中间件
 * @param {object} options 配置参数 
 * @param {number} options.max 每个周期内同一ip的最大访问次数
 * @param {number} options.duration 每个周期的时长，单位毫秒
 * @param {object} options.cache 缓存，可以使用redis实例，默认使用memory cache
 */

const MemoryCache = require('./lib/memory-cache')
const getIp = require('./lib/get-ip')

const prefix = 'rate_limit_ip_'

class RateLimit {
  constructor (options) {
    const config = Object.assign({
      max: 10, // 每个周期内同一ip最大访问次数
      duration: 1000, // 每个周期的时长，单位毫秒
      cache: new MemoryCache() // 缓存
    }, options)

    return function(req, res, next) {
      const ip = getIp(req)
      const key = prefix+ip

      config.cache.get(key).then(current => {
        if(!current) {
          // 周期内未访问过
          config.cache.set(key, 1, 'EX', config.duration / 1000)
          next()
          return
        }

        // 字符串转数字
        current = +current

        if(current >= config.max) {
          // 超过限制次数
          console.info(`用户(ip:${ip})访问${req.path}超过访问频率限制`)
          next('最大访问频率限制')
          return
        }

        // 访问次数加1
        config.cache.incr(key)
        next()
      }).catch(err => {
        console.error(err.message || err)
        next()
      })
    }
  }
}

module.exports = RateLimit