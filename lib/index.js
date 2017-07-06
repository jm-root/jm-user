'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    ['db', 'secret', 'sequenceUserId', 'modelName', 'tableName', 'tableNamePrefix', 'disableAutoUid', 'avatarPrefix', 'avatarDir'].forEach(function (key) {
        process.env[key] && (opts[key] = process.env[key]);
    });

    var o = (0, _service2.default)(opts);
    o.router = _router2.default;
    return o;
};

module.exports = exports['default'];