import jm from 'jm-dao';
import event from 'jm-event';
import _schema from '../schema/user';
import consts from '../consts';
let Err = consts.Err;

export default function (service, opts = {}) {
    let sq = service.sq;
    let schema = opts.schema || _schema();
    if (!opts.disableAutoUid) {
        schema.pre('save', function (next) {
            let self = this;
            if (self.uid !== undefined) return next();
            schema.createUid(function (err, val) {
                if (err) {
                    return next(err);
                }
                self.uid = val;
                next();
            });
        });

        let sequenceUserId = opts.sequenceUserId || consts.SequenceUserId;
        schema.createUid = function (cb) {
            sq.next(sequenceUserId, {}, function (err, val) {
                if (err) {
                    return cb(err, Err.FA_CREATE_USER_UID);
                }
                cb(null, val);
            });
        };
    }

    let model = jm.dao({
        db: opts.db,
        modelName: opts.modelName || 'user',
        tableName: opts.tableName,
        prefix: opts.tableNamePrefix,
        schema: schema,
        schemaExt: opts.schemaExt,
    });
    event.enableEvent(model);

    return model;
};
