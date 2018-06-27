const error = require('jm-err')
const daorouter = require('jm-ms-daorouter')
const avatar = require('./avatar')
const MS = require('jm-ms-core')
const mongoose = require('mongoose')
const help = require('./help')
const wraper = require('./wraper')

let ObjectId = mongoose.Types.ObjectId
let ms = new MS()
let Err = error.Err
module.exports = function (opts = {}) {
  let service = this
  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

  let listOpts = opts.list || {
    conditions: {},
    options: {
      sort: [{'crtime': -1}]
    },
    fields: {
      salt: 0,
      password: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  }

  let getOpts = opts.get || {
    fields: {
      salt: 0,
      password: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  }

  let signon = function (opts, cb) {
    service.signon(opts.data.username, opts.data.password)
      .then(function (doc) {
        cb(null, doc)
      })
      .catch(function (err) {
        let doc = Err.FAIL
        err.code && (doc.err = err.code)
        err.message && (doc.msg = err.message)
        cb(err, t(doc, opts.lng))
      })
  }

  let signup = function (opts, cb) {
    if (opts.ip) {
      opts.data.ip = opts.ip
    }
    service
      .signup(opts.data)
      .then(function (doc) {
        cb(null, {
          id: doc.id,
          uid: doc.uid
        })
      })
      .catch(function (err) {
        let doc = Err.FAIL
        err.code && (doc.err = err.code)
        err.message && (doc.msg = err.message)
        cb(err, t(doc, opts.lng))
      })
  }

  let filterReady = async opts => {
    if (!service.ready) {
      throw error.err(Err.FA_NOTREADY)
    }
  }

  let router = ms.router()
  service.wrapRoute = wraper(service)
  let wrap = service.wrapRoute

  router
    .use(help(service))
    .use(wrap(filterReady, true))

  this.onReady().then(() => {
    router
      .add('/signon', 'post', signon)
      .add('/signup', 'post', signup)
      .use('/users/:id/avatar', avatar(service, opts))
      .add('/users/:id/exists', 'get', function (opts, cb) {
        service.findUser(opts.params.id, function (err, doc) {
          if (!doc) return cb(null, {ret: 0})
          cb(null, {ret: doc.id})
        })
      })
      .add('/users', 'post', signup)
      .add('/users/:id', 'post', function (opts, cb) {
        service
          .updateUser(opts.params.id, opts.data)
          .then(function (doc) {
            cb(null, {
              ret: 1
            })
          })
          .catch(function (err) {
            let doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .add('/users/:id/password', 'post', function (opts, cb) {
        service
          .updatePassword(opts.params.id, opts.data.oldPassword, opts.data.password)
          .then(function (doc) {
            cb(null, {
              ret: 1
            })
          })
          .catch(function (err) {
            let doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .add('/users/:id/ext', 'post', function (opts, cb) {
        service
          .updateUserExt(opts.params.id, opts.data)
          .then(function (doc) {
            cb(null, {
              ret: 1
            })
          })
          .catch(function (err) {
            let doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .add('/users', 'get', function (opts, cb, next) {
        // search
        let search = opts.data.search
        if (!search) return next()
        let ary = []
        // 格式化特殊字符
        search = search.replace(/([`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]])/g, '\\$1')
        let pattern = '.*?' + search + '.*?'
        if (ObjectId.isValid(search)) {
          ary.push({_id: search})
          ary.push({ip: {$regex: pattern, $options: 'i'}})
          ary.push({account: {$regex: pattern, $options: 'i'}})
        } else if (!isNaN(search)) {
          ary.push({uid: Number(search)})
          ary.push({mobile: {$regex: pattern}})
          ary.push({account: {$regex: pattern, $options: 'i'}})
        } else {
          ary.push({account: {$regex: pattern, $options: 'i'}})
          ary.push({mobile: {$regex: pattern}})
          ary.push({nick: {$regex: pattern, $options: 'i'}})
          ary.push({ip: {$regex: pattern, $options: 'i'}})
          ary.push({mac: {$regex: pattern, $options: 'i'}})
        }
        opts.conditions || (opts.conditions = {})
        opts.conditions.$or = ary
        next()
      })
      .use('/users', daorouter(service.user, {
        list: listOpts,
        get: getOpts
      }))
  })
  return router
}
