import chai from 'chai';
let expect = chai.expect;
import config from '../config';
import $ from '../src';

let service = $(config);
let router = service.router();
describe('service', function () {
    it('service', function (done) {
        console.log(service);
        done();
    });
    it('router', function (done) {
        router.get('/', {rows: 2}, function (err, doc) {
            console.log(doc);
            done();
        });
    });
});
