let ERRCODE = 1000;

export default {
    SequenceUserId: 'userId',

    Err: {
        FA_CREATE_USER_UID: {
            err: ERRCODE++,
            msg: 'Create Uid Fail',
        },
        FA_USER_NOT_EXIST: {
            err: ERRCODE++,
            msg: 'User Not Exist',
        },
        FA_USER_EXIST: {
            err: ERRCODE++,
            msg: 'User Already Exist',
        },
        FA_FIND_USER: {
            err: ERRCODE++,
            msg: 'Find User Fail',
        },
        FA_CREATE_USER: {
            err: ERRCODE++,
            msg: 'Create User Fail',
        },
        FA_UPDATE_USER: {
            err: ERRCODE++,
            msg: 'Update User Fail',
        },
        FA_SAVE_USER: {
            err: ERRCODE++,
            msg: 'Save User Fail',
        },
        FA_USER_NOT_ACTIVE: {
            err: ERRCODE++,
            msg: 'User Not Active',
        },
        FA_USER_DELETED: {
            err: ERRCODE++,
            msg: 'User Already Deleted',
        },
        FA_INVALID_USER: {
            err: ERRCODE++,
            msg: 'Invalid User',
        },
        FA_INVALID_PASSWD: {
            err: ERRCODE++,
            msg: 'Invalid Password',
        },
    },
};
