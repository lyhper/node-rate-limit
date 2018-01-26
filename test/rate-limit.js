const RateLimit = require('../index')
const express = require('express')
const request = require('supertest')

describe('RateLimit', () => {
  it('1秒内最多访问5次', done => {
    const limit = new RateLimit({
      max: 5,
      duration: 1 * 1000
    })
    const app = createApp(limit)
    Promise.all([ goodRequest(app), goodRequest(app),
      goodRequest(app),goodRequest(app),
      goodRequest(app),badRequest(app) ])
      .then(() => {
        done()
      })
      .catch(done)
  })
  it('过期后可以继续访问', done => {
    const limit = new RateLimit({
      max: 5,
      duration: 1 * 1000
    })
    const app = createApp(limit)
    Promise.all([ goodRequest(app), goodRequest(app),
      goodRequest(app), goodRequest(app),
      goodRequest(app), goodRequestDelay(app, 1.1 * 1000) ])
      .then(() => {
        done()
      })
      .catch(done)
  })
})

/**
 * 创建应用
 * @param {RateLimit} limit 过滤器实例
 */
function createApp (limit) {
  const app = express()

  app.get('*', limit, (req, res, next) => {
    res.send('ok')
  })
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('500 Internal Server Error')
  })
  return app
}

function goodRequest (app) {
  return new Promise((resolve, reject) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
  })
}

function goodRequestDelay (app, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
    }, delay)
  })
}

function badRequest (app) {
  return new Promise((resolve, reject) => {
    request(app)
      .get('/')
      .expect(500)
      .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
  })
}