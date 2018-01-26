'use strict'

module.exports = function(req) {
  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : '')

  // x-forwarded-for 用逗号分隔
  if(ip.indexOf(',') > -1){
    ip = ip.split(',')[0]
  }
  return ip.replace(/[^\d\.]/img,"")
}