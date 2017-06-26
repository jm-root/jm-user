import chai from 'chai';
let expect = chai.expect;
import config from '../config';
import $ from '../src';

let service = $(config);
let router = service.router();

let user = {
    account: 'jeff',
    passwd: '123',
    mobile: '13600000000',
    email: 'jeff@jamma.cn',
    uid: 99999999,
    nick: 'jeff',
};

describe('service', function () {
    it('passwd', function (done) {
        let o = service.encryptPasswd('123');
        expect(service.checkPasswd(o, '123')).to.be.ok;
        done();
    });

    it('create user', function (done) {
        service.find(user.account, function (err, doc) {
            expect(err === null).to.be.ok;
            if (doc) {
                done();
            } else {
                service.create(user, function (err, doc) {
                    expect(err === null).to.be.ok;
                    done();
                });
            }
        });
    });

    it('findUser account', function (done) {
        service.findUser(user.account, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            service.findUser(doc.uid, function (err, doc) {
                expect(doc.account === user.account).to.be.ok;
                service.findUser(doc.id, function (err, doc) {
                    expect(doc.account === user.account).to.be.ok;
                    done();
                });
            });
        });
    });

    it('findUser email', function (done) {
        service.findUser(user.email, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            done();
        });
    });

    it('findUser mobile', function (done) {
        service.findUser(user.mobile, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            done();
        });
    });

    it('updateUser', function (done) {
        service.findUser(user.account, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            service.updateUser(doc.id, {passwd: '123', gender: 'man'}, function (err, doc) {
                expect(err === null).to.be.ok;
                done();
            });
        });
    });

    it('updateUserExt', function (done) {
        service.findUser(user.account, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            service.updateUserExt(doc.id, {title: 'engineer'}, function (err, doc) {
                expect(err === null).to.be.ok;
                done();
            });
        });
    });

    it('updatePasswd', function (done) {
        service.findUser(user.account, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            let id = doc.id;
            service.updateUser(doc.id, {passwd: '123'}, function (err, doc) {
                expect(err === null).to.be.ok;
                service.updatePasswd(id, user.passwd, '1234', function (err, doc) {
                    expect(doc && !doc.err ).to.be.ok;
                    service.signon(user.account, '1234', function (err, doc) {
                        expect(doc && doc.id !== null).to.be.ok;
                        done();
                    });
                });
            });
        });
    });

    it('signon', function (done) {
        service.findUser(user.account, function (err, doc) {
            expect(doc.account === user.account).to.be.ok;
            service.updateUser(doc.id, {passwd: '123'}, function (err, doc) {
                expect(err === null).to.be.ok;
                service.signon(user.account, user.passwd, function (err, doc) {
                    expect(doc && doc.id !== null).to.be.ok;
                    done();
                });
            });
        });
    });

    it('router', function (done) {
        router.get('/', {rows: 2}, function (err, doc) {
            console.log(doc);
            done();
        });
    });
});
