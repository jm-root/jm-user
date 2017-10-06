require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
var config = {
  development: {
    port: 3000,
    lng: 'zh_CN',
    avatarDir: process.cwd() + '/../uploads',
    avatarPrefix: '/avatar',
    mqtt: 'mqtt://root:123@api.h5.jamma.cn',
    modules: {
      'user': {
        module: process.cwd() + '/lib'
      },
      'jm-user-mqtt': {}
    }
  },
  production: {
    port: 80,
    db: 'mongodb://mongo.db/user',
    tokenExpire: 3600,
    disableVerifyCode: false,
    disableAutoUid: false,
    modules: {
      'user': {
        module: process.cwd() + '/lib'
      },
      'jm-user-mqtt': {}
    }
  }
}

var env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

if (process.env['disableMQTT']) delete config.modules['jm-user-mqtt']

module.exports = config
