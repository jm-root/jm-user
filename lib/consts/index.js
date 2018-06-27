let BaseErrCode = 2600

module.exports = {
  SequenceUserId: 'userId',

  Mode: {
    merge: 0,
    replace: 1,
    assign: 2
  },

  Err: {
    FA_CREATE_USER_UID: {
      err: BaseErrCode++,
      msg: 'Create Uid Fail'
    },
    FA_USER_NOT_EXIST: {
      err: BaseErrCode++,
      msg: 'User Not Exist'
    },
    FA_USER_EXIST: {
      err: BaseErrCode++,
      msg: 'User Already Exist'
    },
    FA_FIND_USER: {
      err: BaseErrCode++,
      msg: 'Find User Fail'
    },
    FA_CREATE_USER: {
      err: BaseErrCode++,
      msg: 'Create User Fail'
    },
    FA_UPDATE_USER: {
      err: BaseErrCode++,
      msg: 'Update User Fail'
    },
    FA_SAVE_USER: {
      err: BaseErrCode++,
      msg: 'Save User Fail'
    },
    FA_USER_NOT_ACTIVE: {
      err: BaseErrCode++,
      msg: 'User Not Active'
    },
    FA_USER_DELETED: {
      err: BaseErrCode++,
      msg: 'User Already Deleted'
    },
    FA_INVALID_USER: {
      err: BaseErrCode++,
      msg: 'Invalid User'
    },
    FA_INVALID_PASSWD: {
      err: BaseErrCode++,
      msg: 'Invalid Password'
    },
    FA_INVALID_ACCOUNT: {
      err: BaseErrCode++,
      msg: 'Invalid Account'
    },
    FA_INVALID_EMAIL: {
      err: BaseErrCode++,
      msg: 'Invalid Email'
    },
    FA_INVALID_MOBILE: {
      err: BaseErrCode++,
      msg: 'Invalid Mobile'
    },
    FA_ACCOUNT_BAN: {
      err: BaseErrCode++,
      msg: 'Account Disabled'
    }
  }
}
