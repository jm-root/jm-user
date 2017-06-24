let ERRCODE = 1000;

export default {
    SequenceUserId: 'user_id',

    Err: {
        FA_CREATE_USER_UID: {
            err: ERRCODE++,
            msg: 'Create Uid Fail',
        },

        FA_USER_EXIST: {
            err: ERRCODE++,
            msg: 'User Already Exist',
        },

    },
};
