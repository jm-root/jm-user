'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (opts) {
    var service = this;
    var router = ms.router();
    this.onReady().then(function () {
        router.use('/:id/avatar', (0, _avatar2.default)(service, opts));
        router.use((0, _jmMsDaorouter2.default)(service.user, opts));
    });
    return router;
};

var _jmMsDaorouter = require('jm-ms-daorouter');

var _jmMsDaorouter2 = _interopRequireDefault(_jmMsDaorouter);

var _avatar = require('./avatar');

var _avatar2 = _interopRequireDefault(_avatar);

var _jmMsCore = require('jm-ms-core');

var _jmMsCore2 = _interopRequireDefault(_jmMsCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ms = new _jmMsCore2.default();
;
module.exports = exports['default'];