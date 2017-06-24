'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ERRCODE = 1000;

exports.default = {
    SequenceUserId: 'user_id',

    Err: {
        FA_CREATE_USER_UID: {
            err: ERRCODE++,
            msg: 'Create Uid Fail'
        },

        FA_USER_EXIST: {
            err: ERRCODE++,
            msg: 'User Already Exist'
        }

    }
};
module.exports = exports['default'];