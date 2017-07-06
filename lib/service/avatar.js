'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (service) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var root = opts.avatarDir || process.cwd() + '/avatar';
    var prefix = opts.avatarPrefix || '';
    var model = {
        save: function save(id, imageData) {
            var file = root + prefix + '/' + id + '.img';
            var base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            var dataBuffer = new Buffer(base64Data, 'base64');
            return new _bluebird2.default(function (resolve, reject) {
                _fsExtra2.default.ensureFile(file, function (err) {
                    if (err) throw err;
                    _fsExtra2.default.writeFile(file, dataBuffer, function (err) {
                        if (err) throw err;
                        resolve(true);
                    });
                });
            });
        },

        get: function get(id) {
            return prefix + '/' + id + '.img';
        }
    };
    _jmEvent2.default.enableEvent(model);

    return model;
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _jmEvent = require('jm-event');

var _jmEvent2 = _interopRequireDefault(_jmEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];