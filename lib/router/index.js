'use strict';

var _jmMsDaorouter = require('jm-ms-daorouter');

var _jmMsDaorouter2 = _interopRequireDefault(_jmMsDaorouter);

var _jmMsCore = require('jm-ms-core');

var _jmMsCore2 = _interopRequireDefault(_jmMsCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ms = new _jmMsCore2.default();
module.exports = function (opts) {
    var service = this;
    var router = ms.router();
    this.onReady().then(function () {
        router.use((0, _jmMsDaorouter2.default)(service.user, opts));
    });
    return router;
};