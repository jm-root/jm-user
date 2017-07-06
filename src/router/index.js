import daorouter from 'jm-ms-daorouter';
import avatar from './avatar';
import MS from 'jm-ms-core';
let ms = new MS();
export default function (opts) {
    let service = this;
    let router = ms.router();
    this.onReady().then(() => {
        router.use('/:id/avatar', avatar(service, opts));
        router.use(daorouter(service.user, opts));
    });
    return router;
};
