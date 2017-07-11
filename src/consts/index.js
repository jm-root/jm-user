let ERRCODE = 1000;

export default {
    SequenceUserId: 'userId',

    Err: {
        FA_CREATE_USER_UID: {
            err: ERRCODE + 1,
            msg: 'Create Uid Fail',
        },
        FA_USER_NOT_EXIST: {
            err: ERRCODE + 2,
            msg: 'User Not Exist',
        },
        FA_USER_EXIST: {
            err: ERRCODE + 3,
            msg: 'User Already Exist',
        },
        FA_FIND_USER: {
            err: ERRCODE + 4,
            msg: 'Find User Fail',
        },
        FA_CREATE_USER: {
            err: ERRCODE + 5,
            msg: 'Create User Fail',
        },
        FA_UPDATE_USER: {
            err: ERRCODE + 6,
            msg: 'Update User Fail',
        },
        FA_SAVE_USER: {
            err: ERRCODE + 7,
            msg: 'Save User Fail',
        },
        FA_USER_NOT_ACTIVE: {
            err: ERRCODE + 8,
            msg: 'User Not Active',
        },
        FA_USER_DELETED: {
            err: ERRCODE + 9,
            msg: 'User Already Deleted',
        },
        FA_INVALID_USER: {
            err: ERRCODE + 10,
            msg: 'Invalid User',
        },
        FA_INVALID_PASSWD: {
            err: ERRCODE + 11,
            msg: 'Invalid Password',
        },
    },
};
