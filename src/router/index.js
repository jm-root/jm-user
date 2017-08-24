import error from 'jm-err'
import daorouter from 'jm-ms-daorouter'
import avatar from './avatar'
import MS from 'jm-ms-core'

let ms = new MS()
let Err = error.Err
export default function (opts = {}) {
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

  var listOpts = opts.list || {
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

  var getOpts = opts.get || {
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

  let router = ms.router()
  this.onReady().then(() => {
    router
      .use('/:id/avatar', avatar(service, opts))
      .add('/:id/exists', 'get', function (opts, cb) {
        service.findUser(opts.params.id, function (err, doc) {
          if (!doc) cb(null, {ret: 0})
          cb(null, {ret: doc.id})
        })
      })
      .add('/', 'post', function (opts, cb) {
        service
          .signup(opts.data)
          .then(function (doc) {
            cb(null, {
              id: doc.id,
              uid: doc.uid
            })
          })
          .catch(function (err) {
            var doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .add('/:id', 'post', function (opts, cb) {
        service
          .updateUser(opts.params.id, opts.data)
          .then(function (doc) {
            cb(null, {
              ret: 1
            })
          })
          .catch(function (err) {
            var doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .add('/:id/ext', 'post', function (opts, cb) {
        service
          .updateUserExt(opts.params.id, opts.data)
          .then(function (doc) {
            cb(null, {
              ret: 1
            })
          })
          .catch(function (err) {
            var doc = Err.FAIL
            err.code && (doc.err = err.code)
            err.message && (doc.msg = err.message)
            cb(err, t(doc, opts.lng))
          })
      })
      .use(daorouter(service.user, {
        list: listOpts,
        get: getOpts
      }))
  })
  return router
};
