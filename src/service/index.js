import jm from 'jm-dao';
import event from 'jm-event';
import consts from '../consts';
let Err = consts.Err;
import schema from '../schema/user';

/**
 * user service
 * @param opts
 * @example
 * opts参数:{
 *  db: 数据库
 *  modelName: 模型名称(可选，默认'user')
 *  tableName: (可选, 表名, 默认等于modelName)
 *  tableNamePrefix: (可选, 表名前缀, 默认为'')
 *  disableAutoUid: 是否禁止自动创建uid
 *  sequenceUserId: uid sequence
 *  schema: 表结构定义(可选, 如果不填采用默认表结构)
 *  schemaExt: 表结构扩展定义(可选, 对于schema扩展定义)
 * }
 * @return {Object} service
 */
export default function (opts = {}) {
    let db = opts.db;

    if(typeof db === 'string') {
        db = jm.db.connect(db);
    }

    db || (db=jm.db.connect());

    let sq = jm.sequence({db: db});
    let model = jm.dao({
        db: db,
        modelName: opts.modelName || 'user',
        tableName: opts.tableName,
        prefix: opts.tableNamePrefix,
        schema: opts.schema || schema(),
        schemaExt: opts.schemaExt,
    });
    event.enableEvent(model);

    if(!opts.disableAutoUid) {
        model.schema.pre('save', function (next) {
            let self = this;
            if(self.uid !== undefined) return next();
            model.createUid(function (err, val) {
                if (err) {
                    return next(err);
                }
                self.uid = val;
                next();
            });
        });

        let sequenceUserId = opts.sequenceUserId || consts.SequenceUserId;
        model.createUid = function(cb) {
            sq.next(sequenceUserId, {}, function (err, val) {
                if (err) {
                    return cb(err, Err.FA_CREATE_USER_UID);
                }
                cb(null, val);
            });
        };
    }

    return model;
};
