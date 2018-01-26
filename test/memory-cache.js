const MemoryCache = require('../lib/memory-cache')

describe('MemoryCache', () => {
  describe('#set()', () => {
    it('key设置为1', done => {
      const cache = new MemoryCache()

      cache.set('someKey', 2)
        .then(val => {
          if (val === 2) {
            done()
          }else{
            const err = new Error('值不为2')
            done(err)
          }
        })
    })
    it('设置过期时间为10秒', done => {
      const cache = new MemoryCache()

      cache.set('someKey', 1, 'EX', 1)
      setTimeout(() => {
        cache.get('someKey')
          .then(val => {
            if (!val) {
              done()
            } else {
              const err = new Error('过期时间后值依然存在')
              done(err)
            }
          })
      }, 1000)
    })
    it('方法清空之前的过期时间', done => {
      const cache = new MemoryCache()

      cache.set('someKey', 1, 'EX', 1)
      cache.set('someKey', 2)
      setTimeout(() => {
        cache.get('someKey')
          .then(val => {
            if (val) {
              done()
            } else {
              const err = new Error('值已经过期')
              done(err)
            }
          })
      }, 1500)
    })
  })
  describe('#get()', () => {
    it('取出的值与存入的值相等', done => {
      const cache = new MemoryCache()

      cache.set('someKey', 2)
        .then(() => {
          return cache.get('someKey')
        })
        .then(val => {
          if (val === 2) {
            done()
          } else {
            const err = new Error('值不为2')
            done(err)
          }
        })
    })
  })
  describe('#incr()', () => {
    it('key对应的值为空时，设置为1', done => {
      const cache = new MemoryCache()

      cache.incr('someKey')
        .then(val => {
          if (val === 1) {
            done()
          } else {
            const err = new Error('值不等于1')
            done(err)
          }
        })
    })
    it('key对应的值加1', done => {
      const cache = new MemoryCache()
  
      cache.set('someKey', 1)
        .then(() => {
          return cache.incr('someKey')
        })
        .then(val => {
          if (val === 2) {
            done()
          } else {
            const err = new Error('值不等于2')
            done(err) 
          }
        })
        .catch(done)
    })
  })
})