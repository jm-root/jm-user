import chai from 'chai'
import config from '../config'
import $ from '../src'

let expect = chai.expect

let service = $(config)
let router = service.router()

let user = {
  account: 'jeff',
  password: '123',
  mobile: '13600000000',
  email: 'jeff@jamma.cn',
  nick: 'jeff'
}

let log = (err, doc) => {
  err && console.error(err.stack)
}

let init = function () {
  return new Promise(function (resolve, reject) {
    service.onReady().then(() => {
      resolve(service.user.findOneAndRemove({account: user.account}))
    })
  })
}

let prepare = function () {
  return init().then(function () {
    return service.signup(user)
  })
}

describe('service', function () {
  it('t', function (done) {
    let o = service.t('Create Uid Fail', 'zh_CN')
    expect(o === '生成UID失败').to.be.ok
    done()
  })

  it('password', function (done) {
    let o = service.encryptPassword('123')
    expect(service.checkPassword(o, '123')).to.be.ok
    done()
  })

  it('findOneAndUpdate', function (done) {
    init()
      .then(function () {
        return service.signup(user)
      })
      .then(function (doc) {
        return service.user.findOneAndUpdate({account: user.account}, {nick: 'jeff234'})
      })
      .then(function (doc) {
        log(null, doc)
        expect(doc).to.be.ok
        done()
      })
  })

  it('create user', function (done) {
    init().then(function () {
      service.user.create(user, function (err, doc) {
        log(err, doc)
        expect(err === null).to.be.ok
        service.user.create(user, function (err, doc) {
          log(err, doc)
          expect(err !== null).to.be.ok
          done()
        })
      })
    })
  })

  it('signup cb', function (done) {
    init().then(function () {
      service.signup(user, function (err, doc) {
        log(err, doc)
        expect(err === null).to.be.ok
        done()
      })
    })
  })

  it('signup', function (done) {
    init().then(function () {
      service.signup(user)
        .then(function (doc) {
          expect(doc !== null).to.be.ok
          return service.signup(user)
        })
        .catch(function (err) {
          log(err)
          expect(err !== null).to.be.ok
          done()
        })
    })
  })

  it('findUser account', function (done) {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        service.findUser(doc.uid, function (err, doc) {
          log(err, doc)
          expect(doc.account === user.account).to.be.ok
          service.findUser(doc.id, function (err, doc) {
            log(err, doc)
            expect(doc.account === user.account).to.be.ok
            done()
          })
        })
      })
    })
  })

  it('findUser email', function (done) {
    prepare().then(function () {
      service.findUser(user.email, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        done()
      })
    })
  })

  it('findUser mobile', function (done) {
    prepare().then(function () {
      service.findUser(user.mobile, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        done()
      })
    })
  })

  it('updateUser cb', function (done) {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        service.updateUser(doc.id, {password: '123', gender: 'man'}, function (err, doc) {
          log(err, doc)
          expect(!err && doc).to.be.ok
          done()
        })
      })
    })
  })

  it('updateUser', function (done) {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        service.updateUser(doc.id, {password: '123', gender: 'man'})
          .then(function (doc) {
            expect(doc).to.be.ok
            done()
          })
      })
    })
  })

  it('updateUserExt', function (done) {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        service.updateUserExt(doc.id, {title: 'engineer'}, function (err, doc) {
          log(err, doc)
          expect(err === null).to.be.ok
          done()
        })
      })
    })
  })

  it('updatePassword', function (done) {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).to.be.ok
        let id = doc.id
        service.updateUser(doc.id, {password: '123'}, function (err, doc) {
          log(err, doc)
          expect(err === null).to.be.ok
          service.updatePassword(id, user.password, '1234', function (err, doc) {
            log(err, doc)
            expect(doc && !doc.err).to.be.ok
            service.signon(user.account, '1234', function (err, doc) {
              log(err, doc)
              expect(doc && doc.id !== null).to.be.ok
              done()
            })
          })
        })
      })
    })
  })

  it('signon', function (done) {
    prepare().then(function () {
      service.findUser(user.account)
        .then(function (doc) {
          return service.updateUser(doc.id, {password: '123'})
        })
        .then(function (doc) {
          return service.signon(user.account, user.password)
        })
        .then(function (doc) {
          expect(doc && doc.id).to.be.ok
          done()
        })
        .catch(function (err) {
          log(err)
        })
    })
  })

  it('signon cb', function (done) {
    prepare().then(function () {
      service.findUser(user.account)
        .then(function (doc) {
          return service.updateUser(doc.id, {password: '123'})
        })
        .then(function (doc) {
          service.signon(user.account, user.password, function (err, doc) {
            log(err, doc)
            expect(doc && doc.id).to.be.ok
            done()
          })
        })
        .catch(function (err) {
          log(err)
        })
    })
  })

  it('avatar save', function (done) {
    prepare().then(function () {
      service.avatar
        .save('123', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAeCAMAAACMnWmDAAAAGFBMVEUAAABQUFAAAAAAAAAAAAAAAAAAAAAAAABiRp8mAAAACHRSTlMA/wAAAAAAACXRGJEAAAmJSURBVHjaAX4JgfYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAQEBAQEAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEAAQEBAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQEAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAAEBAQEBAAAAAAAAAAEBAQAAAAABAQEAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAQEAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFAgGM9lrxNwAAAABJRU5ErkJggg==')
        .then(function (doc) {
          expect(doc).to.be.ok
          console.log(service.avatar.get('123'))
          done()
        })
    })
  })

  it('router', function (done) {
    prepare().then(function () {
      router.get('/users', {rows: 2}, function (err, doc) {
        expect(doc && doc.page).to.be.ok
        done()
      })
    })
  })
})
