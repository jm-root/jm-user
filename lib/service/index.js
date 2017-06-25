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
     * @param {String} passwd  密码明文
     * @return {Object} 返回加密后的密码对象
     * @example
     * 返回结果:{
     *  salt: 密钥
     *  passwd: 密码密文
     * }
     */
    model.encryptPasswd = function (passwd) {
        if (!passwd) return null;
        var salt = createKey('');
        passwd = hash(passwd + salt);
        return { passwd: passwd, salt: salt };
    };

    /**
     * 验证密码
     * @param {Object} passwdEncrypted 密码密钥和密文
     * @example
     * passwdEncrypted参数:{
     *  salt: 密钥(必填)
     *  passwd: 密码密文(必填)
     * }
     * @param {string} passwd 密码明文
     * @return {boolean}
     */
    model.checkPasswd = function (passwdEncrypted, passwd) {
        return passwdEncrypted.passwd == hash(passwd + passwdEncrypted.salt);
    };

    return model;
};

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