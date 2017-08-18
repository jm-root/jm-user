import error from 'jm-err'
import MS from 'jm-ms-core'
let ms = new MS()
let Err = error.Err
export default function (service, opts) {
  let router = ms.router()
  service.onReady().then(() => {
    router.add('/', 'post', function (opts = {}, cb) {
      service.avatar
        .save(opts.params.id, opts.data.imageData)
        .then(function (doc) {
          cb(null, {ret: service.avatar.get(opts.params.id)})
        })
        .catch(function (err) {
          cb(null, Err.FAIL)
        })
    })

    router.add('/', 'get', function (opts, cb) {
      cb(null, {ret: service.avatar.get(opts.params.id)})
    })
  })
  return router
};
