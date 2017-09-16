import _ from 'lodash'
import validator from 'validator'
import bson from 'bson'
import jm from 'jm-dao'
import event from 'jm-event'
import error from 'jm-err'
import crypto from 'crypto'
import Promise from 'bluebird'
import consts from '../consts'
import t from '../locale'

let Err = consts.Err

let isMobile = function (mobile) {
  let pattern = /^1[3,4,5,8]{1}[0-9]{9}$/
  return pattern.test(mobile)
}

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
  let secret = opts.secret || ''
  let db = opts.db

  let hash = function (key) {
    let sha256 = crypto.createHash('sha256')
    sha256.update(key)
    return sha256.digest('hex')
  }

  let createKey = function (key = '') {
    key += secret + Math.random() + Date.now().toString()
    return hash(key)
  }

  let o = {
    ready: false,
    hash: hash,
    createKey: createKey,
    t: t,

    onReady: function () {
      let self = this
      return new Promise(function (resolve, reject) {
        if (self.ready) return resolve(self.ready)
        self.on('ready', function () {
          resolve()
        })
      })
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
    encryptPassword: function (password) {
      if (!password) return null
      let salt = createKey('')
      password = hash(password + salt)
      return {password, salt}
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
    checkPassword: function (passwordEncrypted, password) {
      return passwordEncrypted.password === hash(password + passwordEncrypted.salt)
    },

    /**
     * 更新用户信息
     * @param {string} id
     * @param {Object} opts
     * @param cb
     */
    updateUser: function (id, opts, cb) {
      let c = {_id: id}

      if (opts.password && !opts.salt) {
        let o = this.encryptPassword(opts.password)
        opts.password = o.password
        opts.salt = o.salt
      }

      opts.moditime = Date.now()

      return this.user.update(c, opts, cb)
    },

    /**
     * 更新用户扩展信息
     * @param id
     * @param opts
     * @param replaceAll
     * @param cb
     */
    updateUserExt: function (id, opts, replaceAll, cb) {
      if (typeof replaceAll === 'function') {
        cb = replaceAll
        replaceAll = false
      }

      if (cb) {
        this.updateUserExt(id, opts, replaceAll)
          .then(function (doc) {
            cb(null, doc)
          })
          .catch(function (err) {
            cb(err)
          })
        return this
      }

      return this.user.findById(id)
        .then(function (doc) {
          if (!doc) throw error.err(Err.FA_USER_NOT_EXIST)
          !doc.ext && (doc.ext = {})
          let ext = doc.ext
          if (replaceAll) {
            doc.ext = opts
          } else {
            _.defaults(opts, ext)
            doc.ext = opts
          }
          doc.moditime = Date.now()
          doc.markModified('ext')
          return doc.save()
        })
    },

    /**
     * 修改密码
     * @param oldPassword
     * @param password
     * @param cb
     */
    updatePassword: function (id, oldPassword, password, cb) {
      if (cb) {
        this.updatePassword(id, oldPassword, password)
          .then(function (doc) {
            cb(null, doc)
          })
          .catch(function (err) {
            cb(err)
          })
        return this
      }

      let self = this
      return this.user.findById(id)
        .then(function (doc) {
          if (!doc) throw error.err(Err.FA_USER_NOT_EXIST)

          if (!self.checkPassword(doc, oldPassword)) {
            throw error.err(Err.FA_INVALID_PASSWD)
          }

          let o = {
            password: password
          }
          return self.updateUser(id, o, cb)
        })
    },

    /**
     * 查找一个用户
     * @param {*} username 查找项
     * @param cb
     */
    findUser: function (username, cb) {
      let query = []
      if (typeof username === 'number' || validator.isInt(username)) {
        if (isMobile(username)) {
          query.push({
            mobile: username
          })
        } else {
          query.push({
            uid: username
          })
        }
      } else if (validator.isEmail(username)) {
        query.push({
          email: username
        })
      } else if (bson.ObjectId.isValid(username)) {
        query.push({
          _id: username
        })
      } else {
        query.push({
          account: username
        })
      }

      return this.user.findOne({'$or': query}, cb)
    },

    /**
     * 登陆
     * @param {String|number|*} username
     * @param {String} password
     * @param cb
     */
    signon: function (username, password, cb) {
      let self = this
      if (cb) {
        this.signon(username, password)
          .then(function (doc) {
            cb(null, doc)
          })
          .catch(function (err) {
            cb(err)
          })
        return this
      }
      return this.findUser(username)
        .then(function (doc) {
          if (!doc) throw error.err(Err.FA_USER_NOT_EXIST)
          if (!self.checkPassword(doc, password)) throw error.err(Err.FA_INVALID_PASSWD)
          return {id: doc.id}
        })
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
    signup: function (opts, cb) {
      let self = this
      let data = {}
      _.defaults(data, opts)
      if (data.password && !data.salt) {
        let p = this.encryptPassword(data.password)
        data.password = p.password
        data.salt = p.salt
      }

      let query = []
      if (data.mobile) {
        query.push({
          mobile: data.mobile
        })
      }
      if (data.uid) {
        query.push({
          uid: data.uid
        })
      }
      if (data.account) {
        query.push({
          account: data.account
        })
      }
      if (data.email) {
        query.push({
          email: data.email
        })
      }
      // 允许游客注册
      if (!query.length) {
        return self.user.create(data, cb)
      }
      return this.user.findOne({'$or': query})
        .then(function (doc) {
          if (doc) throw error.err(Err.FA_USER_EXIST)
          return self.user.create(data, cb)
        })
    }

  }
  event.enableEvent(o)

  let cb = function (db) {
    opts.db = db
    o.sq = jm.sequence({db: db})
    o.user = require('./user')(o, opts)
    o.avatar = require('./avatar')(o, opts)
    o.ready = true
    o.emit('ready')
  }

  if (!db) {
    db = jm.db.connect().then(cb)
  } else if (typeof db === 'string') {
    db = jm.db.connect(db).then(cb)
  }

  return o
};
