'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (service) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var sq = service.sq;
  var schema = opts.schema || (0, _user2.default)();
  if (!opts.disableAutoUid) {
    schema.pre('save', function (next) {
      var self = this;
      if (self.uid !== undefined) return next();
      schema.createUid(function (err, val) {
        if (err) {
          return next(err);
        }
        self.uid = val;
        next();
      });
    });

    var sequenceUserId = opts.sequenceUserId || _consts2.default.SequenceUserId;
    schema.createUid = function (cb) {
      sq.next(sequenceUserId, {}, function (err, val) {
        if (err) {
          return cb(err, Err.FA_CREATE_USER_UID);
        }
        cb(null, val);
      });
    };
  }

  schema.post('save', function (doc) {
    doc && service.emit('user.update', { id: doc.id });
  }).post('remove', function (doc) {
    doc && service.emit('user.remove', { id: doc.id });
  }).post('update', function (doc) {
    if (!doc.result.nModified) return;
    this.model.find(this._conditions).then(function (docs) {
      docs.forEach(function (doc) {
        service.emit('user.update', { id: doc.id });
      });
    });
  });

  var model = _jmDao2.default.dao({
    db: opts.db,
    modelName: opts.modelName || 'user',
    tableName: opts.tableName,
    prefix: opts.tableNamePrefix,
    schema: schema,
    schemaExt: opts.schemaExt
  });
  _jmEvent2.default.enableEvent(model);

  return model;
};

var _jmDao = require('jm-dao');

var _jmDao2 = _interopRequireDefault(_jmDao);

var _jmEvent = require('jm-event');

var _jmEvent2 = _interopRequireDefault(_jmEvent);

var _user = require('../schema/user');

var _user2 = _interopRequireDefault(_user);

var _consts = require('../consts');

var _consts2 = _interopRequireDefault(_consts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Err = _consts2.default.Err;

;
module.exports = exports['default'];