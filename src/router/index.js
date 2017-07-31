import error from 'jm-err';
import daorouter from 'jm-ms-daorouter';
import avatar from './avatar';
import MS from 'jm-ms-core';
let ms = new MS();
let Err = error.Err;
export default function (opts = {}) {
    let service = this;
    let t = function (doc, lng) {
        if (doc && lng && doc.err && doc.msg) {
            return {
                err: doc.err,
                msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg,
            }
        }
        return doc;
    };
    service.routes || (service.routes = {});
    let routes = service.routes;
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
                sort: [{'crtime': -1}]
            },

            fields: {
                salt: 0,
                password: 0
            },
        };

    var getOpts = opts.get || {
            fields: {
                salt: 0,
                password: 0
            },
        };

    let router = ms.router();
    this.onReady().then(() => {
        router.use('/:id', routes.filter_update);
        router.use('/:id/avatar', avatar(service, opts));
        router.use(daorouter(service.user, {
            list: listOpts,
            get: getOpts,
        }));
    });
    return router;
};
