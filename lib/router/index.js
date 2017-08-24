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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ms = new _jmMsCore2.default();
var Err = _jmErr2.default.Err;
;
module.exports = exports['default'];