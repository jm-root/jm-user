const service = require('./service')
const router = require('./router')

module.exports = (opts = {}) => {
  ['db', 'secret', 'sequenceUserId', 'modelName', 'tableName', 'tableNamePrefix', 'disableAutoUid', 'avatarPrefix', 'avatarDir']
    .forEach(function (key) {
      process.env[key] && (opts[key] = process.env[key])
    })

  let o = service(opts)
  o.router = router
  return o
}
