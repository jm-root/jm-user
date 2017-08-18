'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (service, opts) {
  var router = ms.router();
  service.onReady().then(function () {
    router.add('/', 'post', function () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var cb = arguments[1];

      service.avatar.save(opts.params.id, opts.data.imageData).then(function (doc) {
        cb(null, { ret: service.avatar.get(opts.params.id) });
      }).catch(function (err) {
        cb(null, Err.FAIL);
      });
    });

    router.add('/', 'get', function (opts, cb) {
      cb(null, { ret: service.avatar.get(opts.params.id) });
    });
  });
  return router;
};

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmMsCore = require('jm-ms-core');

var _jmMsCore2 = _interopRequireDefault(_jmMsCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ms = new _jmMsCore2.default();
var Err = _jmErr2.default.Err;
;
module.exports = exports['default'];