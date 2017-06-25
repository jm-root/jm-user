import chai from 'chai';
let expect = chai.expect;
import config from '../config';
import $ from '../src';

let service = $(config);
let router = service.router();
describe('service', function () {
    it('passwd', function (done) {
        let o = service.encryptPasswd('123');
        expect(service.checkPasswd(o, '123')).to.be.ok;
        done();
    });
    it('router', function (done) {
        router.get('/', {rows: 2}, function (err, doc) {
            console.log(doc);
            done();
        });
    });
});
