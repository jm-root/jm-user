require('log4js').configure(__dirname + '/log4js.json');
var config = {
    development: {
        port: 3000,
        lng: 'zh_CN',
        avatarDir:  process.cwd() + '/../uploads',
        avatarPrefix: '/avatar',
        modules: {
            'users': {
                module: process.cwd() + '/lib'
            }
        }
    },
    production: {
        port: 3000,
        db: 'mongodb://mongo.db/user',
        tokenExpire: 3600,
        disableVerifyCode: false,
        disableAutoUid: false,
        modules: {
            'users': {
                module: process.cwd() + '/lib'
            }
        }
    }
};

var env = process.env.NODE_ENV || 'development';
config = config[env] || config['development'];
config.env = env;

module.exports = config;
