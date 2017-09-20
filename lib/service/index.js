'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var secret = opts.secret || '';
  var db = opts.db;

  var hash = function hash(key) {
    var sha256 = _crypto2.default.createHash('sha256');
    sha256.update(key);
    return sha256.digest('hex');
  };

  var createKey = function createKey() {
    var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    key += secret + Math.random() + Date.now().toString();
    return hash(key);
  };

  var o = {
    ready: false,
    hash: hash,
    createKey: createKey,
    t: _locale2.default,

    onReady: function onReady() {
      var self = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (self.ready) return resolve(self.ready);
        self.on('ready', function () {
          resolve();
        });
      });
    },

    /**
     * 对密码加密
     * @param {String} password  密码明文
     * @return {Object} 返回加密后的密码对象
     * @example
     * 返回结果:{
     *  salt: 密钥
     *  password: 密码密文
     * }
     */
    encryptPassword: function encryptPassword(password) {
      if (!password) return null;
      var salt = createKey('');
      password = hash(password + salt);
      return { password: password, salt: salt };
    },

    /**
     * 验证密码
     * @param {Object} passwordEncrypted 密码密钥和密文
     * @example
     * passwordEncrypted参数:{
     *  salt: 密钥(必填)
     *  password: 密码密文(必填)
     * }
     * @param {string} password 密码明文
     * @return {boolean}
     */
    checkPassword: function checkPassword(passwordEncrypted, password) {
      return passwordEncrypted.password === hash(password + passwordEncrypted.salt);
    },

    /**
     * 更新用户信息
     * @param {string} id
     * @param {Object} opts
     * @param cb
     */
    updateUser: function updateUser(id, opts, cb) {
      var c = { _id: id };

      if (opts.password && !opts.salt) {
        var _o = this.encryptPassword(opts.password);
        opts.password = _o.password;
        opts.salt = _o.salt;
      }

      opts.moditime = Date.now();

      return this.user.update(c, opts, cb);
    },

    /**
     * 更新用户扩展信息
     * @param id
     * @param opts
     * @param replaceAll
     * @param cb
     */
    updateUserExt: function updateUserExt(id, opts, replaceAll, cb) {
      if (typeof replaceAll === 'function') {
        cb = replaceAll;
        replaceAll = false;
      }

      if (cb) {
        this.updateUserExt(id, opts, replaceAll).then(function (doc) {
          cb(null, doc);
        }).catch(function (err) {
          cb(err);
        });
        return this;
      }

      return this.user.findById(id).then(function (doc) {
        if (!doc) throw _jmErr2.default.err(Err.FA_USER_NOT_EXIST);
        !doc.ext && (doc.ext = {});
        var ext = doc.ext;
        if (replaceAll) {
          doc.ext = opts;
        } else {
          _lodash2.default.defaults(opts, ext);
          doc.ext = opts;
        }
        doc.moditime = Date.now();
        doc.markModified('ext');
        return doc.save();
      });
    },

    /**
     * 修改密码
     * @param oldPassword
     * @param password
     * @param cb
     */
    updatePassword: function updatePassword(id, oldPassword, password, cb) {
      if (cb) {
        this.updatePassword(id, oldPassword, password).then(function (doc) {
          cb(null, doc);
        }).catch(function (err) {
          cb(err);
        });
        return this;
      }

      var self = this;
      return this.user.findById(id).then(function (doc) {
        if (!doc) throw _jmErr2.default.err(Err.FA_USER_NOT_EXIST);

        if (!self.checkPassword(doc, oldPassword)) {
          throw _jmErr2.default.err(Err.FA_INVALID_PASSWD);
        }

        var o = {
          password: password
        };
        return self.updateUser(id, o, cb);
      });
    },

    /**
     * 查找一个用户
     * @param {*} username 查找项
     * @param cb
     */
    findUser: function findUser(username, cb) {
      var query = [];
      if (typeof username === 'number' || _validator2.default.isInt(username)) {
        if (isMobile(username)) {
          query.push({
            mobile: username
          });
        } else {
          query.push({
            uid: username
          });
        }
      } else if (_validator2.default.isEmail(username)) {
        query.push({
          email: username
        });
      } else if (_bson2.default.ObjectId.isValid(username)) {
        query.push({
          _id: username
        });
      } else {
        query.push({
          account: username
        });
      }

      return this.user.findOne({ '$or': query }, cb);
    },

    /**
     * 登陆
     * @param {String|number|*} username
     * @param {String} password
     * @param cb
     */
    signon: function signon(username, password, cb) {
      var self = this;
      if (cb) {
        this.signon(username, password).then(function (doc) {
          cb(null, doc);
        }).catch(function (err) {
          cb(err);
        });
        return this;
      }
      return this.findUser(username).then(function (doc) {
        if (!doc) throw _jmErr2.default.err(Err.FA_USER_NOT_EXIST);
        if (!self.checkPassword(doc, password)) throw _jmErr2.default.err(Err.FA_INVALID_PASSWD);
        return { id: doc.id };
      });
    },

    /**
     * 注册
     * @example
     * signup({
      *     account: 'jeff',
      *     password: '123'
      * })
     * @param {Object} opts - 参数
     * @param {Function} cb - callback
     * @return {Promise}
     */
    signup: function signup(opts, cb) {
      var self = this;
      var data = {};
      _lodash2.default.defaults(data, opts);
      if (data.password && !data.salt) {
        var p = this.encryptPassword(data.password);
        data.password = p.password;
        data.salt = p.salt;
      }

      var query = [];
      if (data.mobile) {
        query.push({
          mobile: data.mobile
        });
      }
      if (data.uid) {
        query.push({
          uid: data.uid
        });
      }
      if (data.account) {
        query.push({
          account: data.account
        });
      }
      if (data.email) {
        query.push({
          email: data.email
        });
      }
      // 允许游客注册
      if (!query.length) {
        return self.user.create(data, cb);
      }
      return this.user.findOne({ '$or': query }).then(function (doc) {
        if (doc) throw _jmErr2.default.err(Err.FA_USER_EXIST);
        return self.user.create(data, cb);
      });
    }

  };
  _jmEvent2.default.enableEvent(o);

  var cb = function cb(db) {
    opts.db = db;
    o.sq = _jmDao2.default.sequence({ db: db });
    o.user = require('./user')(o, opts);
    o.avatar = require('./avatar')(o, opts);
    o.ready = true;
    o.emit('ready');
  };

  if (!db) {
    db = _jmDao2.default.db.connect().then(cb);
  } else if (typeof db === 'string') {
    db = _jmDao2.default.db.connect(db).then(cb);
  }

  return o;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _bson = require('bson');

var _bson2 = _interopRequireDefault(_bson);

var _jmDao = require('jm-dao');

var _jmDao2 = _interopRequireDefault(_jmDao);

var _jmEvent = require('jm-event');

var _jmEvent2 = _interopRequireDefault(_jmEvent);

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _consts = require('../consts');

var _consts2 = _interopRequireDefault(_consts);

var _locale = require('../locale');

var _locale2 = _interopRequireDefault(_locale);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _consts2.default.Err;

var isMobile = function isMobile(mobile) {
  var pattern = /^1[3,4,5,7,8]{1}[0-9]{9}$/;
  return pattern.test(mobile);
};

/**
 * user service
 * @param {Object} opts
 * @example
 * opts参数:{
 *  db: 数据库
 *  secret: (可选, 密钥, 用于加密明文密码, 默认'')
 *  modelName: 模型名称(可选，默认'user')
 *  tableName: (可选, 表名, 默认等于modelName)
 *  tableNamePrefix: (可选, 表名前缀, 默认为'')
 *  disableAutoUid: 是否禁止自动创建uid
 *  sequenceUserId: uid sequence
 *  schema: 表结构定义(可选, 如果不填采用默认表结构)
 *  schemaExt: 表结构扩展定义(可选, 对于schema扩展定义)
 * }
 * @return {Object} service
 */
;
module.exports = exports['default'];