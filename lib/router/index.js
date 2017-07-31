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
    service.routes || (service.routes = {});
    var routes = service.routes;
    routes.filter_update = function (opts, cb, next) {
        if (opts.type === 'get') return next();
        if (opts.headers && opts.headers.acl_user) {
            var user = opts.headers.acl_user;
            if (opts.params.id && opts.params.id != user) return cb(null, t(Err.FA_NOPERMISSION, opts.lng));
        }
        next();
    };

    var listOpts = opts.list || {
        conditions: {},

        options: {
            sort: [{ 'crtime': -1 }]
        },

        fields: {
            salt: 0,
            password: 0
        }
    };

    var getOpts = opts.get || {
        fields: {
            salt: 0,
            password: 0
        }
    };

    var router = ms.router();
    this.onReady().then(function () {
        router.use('/:id', routes.filter_update);
        router.use('/:id/avatar', (0, _avatar2.default)(service, opts));
        router.use((0, _jmMsDaorouter2.default)(service.user, {
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