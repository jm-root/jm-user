import Promise from 'bluebird'
import fse from 'fs-extra'
import event from 'jm-event'

export default function (service, opts = {}) {
  let root = opts.avatarDir || process.cwd() + '/avatar'
  let prefix = opts.avatarPrefix || ''
  let model = {
    save: function (id, imageData) {
      let file = root + prefix + '/' + id + '.img'
      let base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      let dataBuffer = new Buffer(base64Data, 'base64')
      return new Promise(function (resolve, reject) {
        fse.ensureFile(file, function (err) {
          if (err) throw err
          fse.writeFile(file, dataBuffer, function (err) {
            if (err) throw err
            resolve(true)
          })
        })
      })
    },

    get: function (id) {
      return prefix + '/' + id + '.img'
    }
  }
  event.enableEvent(model)

  return model
};
