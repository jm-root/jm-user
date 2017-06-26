import _ from 'lodash';
import validator from 'validator';
import bson from 'bson';
import jm from 'jm-dao';
import event from 'jm-event';
import consts from '../consts';
let Err = consts.Err;
import schema from '../schema/user';
import crypto from 'crypto';

let isMobile = function (mobile) {
    let pattern = /^1[3,4,5,8]{1}[0-9]{9}$/;
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
export default function (opts = {}) {
    let db = opts.db;
    let secret = opts.secret || '';

    if (typeof db === 'string') {
        db = jm.db.connect(db);
    }

    db || (db = jm.db.connect());

    let sq = jm.sequence({db: db});
    let model = jm.dao({
        db: db,
        modelName: opts.modelName || 'user',
        tableName: opts.tableName,
        prefix: opts.tableNamePrefix,
        schema: opts.schema || schema(),
        schemaExt: opts.schemaExt,
    });
    event.enableEvent(model);

    if (!opts.disableAutoUid) {
        model.schema.pre('save', function (next) {
            let self = this;
            if (self.uid !== undefined) return next();
            model.createUid(function (err, val) {
                if (err) {
                    return next(err);
                }
                self.uid = val;
                next();
            });
        });

        let sequenceUserId = opts.sequenceUserId || consts.SequenceUserId;
        model.createUid = function (cb) {
            sq.next(sequenceUserId, {}, function (err, val) {
                if (err) {
                    return cb(err, Err.FA_CREATE_USER_UID);
                }
                cb(null, val);
            });
        };
    }

    let hash = function (key) {
        let sha256 = crypto.createHash('sha256');
        sha256.update(key);
        return sha256.digest('hex');
    };

    let createKey = function (key = '') {
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
        let salt = createKey('');
        passwd = hash(passwd + salt);
        return {passwd, salt};
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

    /**
     * 更新用户信息
     * @param {string} id
     * @param {Object} opts
     * @param cb
     */
    model.updateUser = function (id, opts, cb) {
        let self = this;
        let c = {_id: id};

        if (opts.passwd && !opts.salt) {
            let o = this.encryptPasswd(opts.passwd);
            opts.passwd = o.passwd;
            opts.salt = o.salt;
        }

        this.update(c, opts, {}, function (err, doc) {
            if (err) {
                cb(err, Err.FA_UPDATE_USER);
            } else {
                self.emit('updateUser', id, opts, doc);
                cb(err, doc);
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
        let self = this;
        if (typeof replaceAll === 'function') {
            cb = replaceAll;
            replaceAll = false;
        }
        this.findById(id, function (err, doc) {
            if (err) {
                cb(err, Err.FA_FIND_USER);
                return self;
            }

            if (!doc) {
                cb(null, Err.FA_USER_NOT_EXIST);
                return self;
            }

            if (!doc.ext) {
                doc.ext = {};
            }
            let ext = doc.ext;
            if (replaceAll) {
                doc.ext = opts;
            } else {
                _.defaults(opts, ext);
                doc.ext = opts;
            }
            doc.markModified('ext');
            doc.save(function (err, doc) {
                if (err) {
                    cb(err, Err.FA_SAVE_USER);
                } else {
                    self.emit('updateUserExt', id, opts, doc);
                    cb(err, doc);
                }
            });
        });
    };

    /**
     * 修改密码
     * @param oldPasswd
     * @param passwd
     * @param cb
     */
    model.updatePasswd = function (id, oldPasswd, passwd, cb) {
        let self = this;
        this.findById(id, function (err, doc) {
            if (err) {
                return cb(err, Err.FA_FIND_USER);
            }

            if (!doc) {
                return cb(null, Err.FA_USER_NOT_EXIST);
            }

            if (!self.checkPasswd(doc, oldPasswd)) {
                return cb(null, Err.FA_INVALID_PASSWD);
            }

            let o = {
                passwd: passwd,
            };
            self.updateUser(id, o, cb);
        });
        return self;
    };

    /**
     * 查找一个用户
     * @param {*} username 查找项
     * @param cb
     */
    model.findUser = function (username, cb) {
        let query = [];
        if (typeof username === 'number' || validator.isInt(username)) {
            if (isMobile(username)) {
                query.push({
                    mobile: username,
                });
            } else {
                query.push({
                    uid: username,
                });
            }
        } else if (validator.isEmail(username)) {
            query.push({
                email: username,
            });
        } else if (bson.ObjectId.isValid(username)) {
            query.push({
                _id: username,
            });
        } else {
            query.push({
                account: username,
            });
        }

        this.findOne({'$or': query}, function (err, doc) {
            if (err) {
                cb(err, Err.FA_FIND_USER);
            } else {
                cb(err, doc);
            }
        });
    };

    /**
     * 登陆验证
     * @param {*} username
     * @param {String} passwd
     * @param cb
     */
    model.signon = function (username, passwd, cb) {
        let self = this;
        this.findUser(username, function (err, doc) {
            if (err || !doc) return cb(err, doc);
            if (self.checkPasswd(doc, passwd)) {
                return cb(null, {id: doc.id});
            }
            cb(null, Err.FA_INVALID_PASSWD);
        });
        return this;
    };
    return model;
};
