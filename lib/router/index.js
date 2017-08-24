'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var service = this;
  var t = function t(doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      };
    }
    return doc;
  };

  var listOpts = opts.list || {
    conditions: {},
    options: {
      sort: [{ 'crtime': -1 }]
    },
    fields: {
      salt: 0,
      password: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  };

  var getOpts = opts.get || {
    fields: {
      salt: 0,
      password: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  };

  var router = ms.router();
  this.onReady().then(function () {
    router.use('/:id/avatar', (0, _avatar2.default)(service, opts)).add('/:id/exists', 'get', function (opts, cb) {
      service.findUser(opts.params.id, function (err, doc) {
        if (!doc) cb(null, { ret: 0 });
        cb(null, { ret: doc.id });
      });
    }).add('/', 'post', function (opts, cb) {
      if (opts.ip) {
        opts.data.ip = opts.ip;
      }
      service.signup(opts.data).then(function (doc) {
        cb(null, {
          id: doc.id,
          uid: doc.uid
        });
      }).catch(function (err) {
        var doc = Err.FAIL;
        err.code && (doc.err = err.code);
        err.message && (doc.msg = err.message);
        cb(err, t(doc, opts.lng));
      });
    }).add('/:id', 'post', function (opts, cb) {
      service.updateUser(opts.params.id, opts.data).then(function (doc) {
        cb(null, {
          ret: 1
        });
      }).catch(function (err) {
        var doc = Err.FAIL;
        err.code && (doc.err = err.code);
        err.message && (doc.msg = err.message);
        cb(err, t(doc, opts.lng));
      });
    }).add('/:id/ext', 'post', function (opts, cb) {
      service.updateUserExt(opts.params.id, opts.data).then(function (doc) {
        cb(null, {
          ret: 1
        });
      }).catch(function (err) {
        var doc = Err.FAIL;
        err.code && (doc.err = err.code);
        err.message && (doc.msg = err.message);
        cb(err, t(doc, opts.lng));
      });
    }).add('/', 'get', function (opts, cb, next) {
      // search
      var search = opts.data.search;
      if (!search) return next();
      var ary = [];
      // 格式化特殊字符
      search = search.replace(/([`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]])/g, "\\$1");
      var pattern = ".*?" + search + ".*?";
      if (ObjectId.isValid(search)) {
        ary.push({ _id: search });
        ary.push({ ip: { $regex: pattern, $options: "i" } });
        ary.push({ account: { $regex: pattern, $options: "i" } });
      } else if (!isNaN(search)) {
        ary.push({ uid: Number(search) });
        ary.push({ mobile: { $regex: pattern } });
        ary.push({ account: { $regex: pattern, $options: "i" } });
      } else {
        ary.push({ account: { $regex: pattern, $options: "i" } });
        ary.push({ mobile: { $regex: pattern } });
        ary.push({ nick: { $regex: pattern, $options: "i" } });
        ary.push({ ip: { $regex: pattern, $options: "i" } });
        ary.push({ mac: { $regex: pattern, $options: "i" } });
      }
      opts.conditions || (opts.conditions = {});
      opts.conditions.$or = ary;
      next();
    }).use((0, _jmMsDaorouter2.default)(service.user, {
      list: listOpts,
      get: getOpts
    }));
  });
  return router;
};

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmMsDaorouter = require('jm-ms-daorouter');

var _jmMsDaorouter2 = _interopRequireDefault(_jmMsDaorouter);

var _avatar = require('./avatar');

var _avatar2 = _interopRequireDefault(_avatar);

var _jmMsCore = require('jm-ms-core');

var _jmMsCore2 = _interopRequireDefault(_jmMsCore);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;
var ms = new _jmMsCore2.default();
var Err = _jmErr2.default.Err;
;
module.exports = exports['default'];