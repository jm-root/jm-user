'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var db = opts.db;
    var secret = opts.secret || '';

    if (typeof db === 'string') {
        db = _jmDao2.default.db.connect(db);
    }

    db || (db = _jmDao2.default.db.connect());

    var sq = _jmDao2.default.sequence({ db: db });
    var model = _jmDao2.default.dao({
        db: db,
        modelName: opts.modelName || 'user',
        tableName: opts.tableName,
        prefix: opts.tableNamePrefix,
        schema: opts.schema || (0, _user2.default)(),
        schemaExt: opts.schemaExt
    });
    _jmEvent2.default.enableEvent(model);

    if (!opts.disableAutoUid) {
        model.schema.pre('save', function (next) {
            var self = this;
            if (self.uid !== undefined) return next();
            model.createUid(function (err, val) {
                if (err) {
                    return next(err);
                }
                self.uid = val;
                next();
            });
        });

        var sequenceUserId = opts.sequenceUserId || _consts2.default.SequenceUserId;
        model.createUid = function (cb) {
            sq.next(sequenceUserId, {}, function (err, val) {
                if (err) {
                    return cb(err, Err.FA_CREATE_USER_UID);
                }
                cb(null, val);
            });
        };
    }

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
    model.encryptPassword = function (password) {
        if (!password) return null;
        var salt = createKey('');
        password = hash(password + salt);
        return { password: password, salt: salt };
    };

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
    model.checkPassword = function (passwordEncrypted, password) {
        return passwordEncrypted.password == hash(password + passwordEncrypted.salt);
    };

    /**
     * 更新用户信息
     * @param {string} id
     * @param {Object} opts
     * @param cb
     */
    model.updateUser = function (id, opts, cb) {
        var self = this;
        var c = { _id: id };

        if (opts.password && !opts.salt) {
            var o = this.encryptPassword(opts.password);
            opts.password = o.password;
            opts.salt = o.salt;
        }

        this.update(c, opts, {}, function (err, doc) {
            if (err) {
                cb && cb(err, Err.FA_UPDATE_USER);
            } else {
                self.emit('updateUser', id, opts, doc);
                cb && cb(err, doc);
            }
        });
        return this;
    };

    /**
     * 更新用户扩展信息
     * @param id
     * @param opts
     * @param replaceAll
     * @param cb
     */
    model.updateUserExt = function (id, opts, replaceAll, cb) {
        var self = this;
        if (typeof replaceAll === 'function') {
            cb = replaceAll;
            replaceAll = false;
        }
        this.findById(id, function (err, doc) {
            if (err) {
                cb && cb(err, Err.FA_FIND_USER);
            }

            if (!doc) {
                cb && cb(null, Err.FA_USER_NOT_EXIST);
            }

            if (!doc.ext) {
                doc.ext = {};
            }
            var ext = doc.ext;
            if (replaceAll) {
                doc.ext = opts;
            } else {
                _lodash2.default.defaults(opts, ext);
                doc.ext = opts;
            }
            doc.markModified('ext');
            doc.save(function (err, doc) {
                if (err) {
                    cb && cb(err, Err.FA_SAVE_USER);
                } else {
                    self.emit('updateUserExt', id, opts, doc);
                    cb && cb(err, doc);
                }
            });
        });
        return this;
    };

    /**
     * 修改密码
     * @param oldPassword
     * @param password
     * @param cb
     */
    model.updatePassword = function (id, oldPassword, password, cb) {
        var self = this;
        this.findById(id, function (err, doc) {
            if (err) {
                cb && cb(err, Err.FA_FIND_USER);
                return;
            }

            if (!doc) {
                cb && cb(null, Err.FA_USER_NOT_EXIST);
                return;
            }

            if (!self.checkPassword(doc, oldPassword)) {
                cb && cb(null, Err.FA_INVALID_PASSWD);
                return;
            }

            var o = {
                password: password
            };
            self.updateUser(id, o, cb);
        });
        return this;
    };

    /**
     * 查找一个用户
     * @param {*} username 查找项
     * @param cb
     */
    model.findUser = function (username, cb) {
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

        this.findOne({ '$or': query }, function (err, doc) {
            if (err) {
                cb && cb(err, Err.FA_FIND_USER);
            } else {
                cb && cb(err, doc);
            }
        });
        return this;
    };

    /**
     * 登陆验证
     * @param {*} username
     * @param {String} password
     * @param cb
     */
    model.signon = function (username, password, cb) {
        var self = this;
        this.findUser(username, function (err, doc) {
            if (err || !doc) {
                cb && cb(err, doc);
                return;
            }
            if (self.checkPassword(doc, password)) {
                cb && cb(null, { id: doc.id });
                return;
            }
            cb && cb(null, Err.FA_INVALID_PASSWD);
        });
        return this;
    };

    /**
     * 注册
     * @param opts
     * @param cb
     */
    model.signup = function (opts, cb) {
        var data = {};
        _lodash2.default.defaults(data, opts);
        if (data.password && !data.salt) {
            var p = this.encryptPassword(data.password);
            data.password = p.password;
            data.salt = p.salt;
        }
        this.create(data, cb);
        return this;
    };

    return model;
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

var _consts = require('../consts');

var _consts2 = _interopRequireDefault(_consts);

var _user = require('../schema/user');

var _user2 = _interopRequireDefault(_user);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _consts2.default.Err;


var isMobile = function isMobile(mobile) {
    var pattern = /^1[3,4,5,8]{1}[0-9]{9}$/;
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