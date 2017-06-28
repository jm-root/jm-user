import daorouter from 'jm-ms-daorouter';
import MS from 'jm-ms-core';
let ms = new MS();
module.exports = function (opts) {
    let service = this;
    let router = ms.router();
    this.onReady().then(()=>{
        router.use(daorouter(service.user, opts));
    });
    return router;
};
