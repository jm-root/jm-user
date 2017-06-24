require('log4js').configure(__dirname + '/log4js.json');
var config = {
    development: {
        port: 3000,
        modules: {
            'users': {
                module: process.cwd() + '/lib'
            }
        }
    },
    production: {
        port: 3000,
        mq: 'redis://redis.db',
        db: 'mongodb://mongo.db/sso',
        tableNamePrefix: 'sso_',
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