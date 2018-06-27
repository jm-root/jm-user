const $ = require('./service')

let user = {
  account: 'jeff',
  password: '123',
  mobile: '13600000000',
  email: 'jeff@jamma.cn',
  nick: 'jeff'
}

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
})

let init = async function () {
  let doc = await service.user.findOneAndRemove({account: user.account})
  return doc
}

let prepare = async function () {
  await init()
  let doc = await service.signup(user)
  return doc
}

describe('service', () => {
  test('t', async () => {
    let o = service.t('Create Uid Fail', 'zh_CN')
    expect(o === '生成UID失败').toBeTruthy()
  })

  test('password', async () => {
    let o = service.encryptPassword('123')
    expect(service.checkPassword(o, '123')).toBeTruthy()
  })

  test('findOneAndUpdate', async () => {
    await init()
    let doc = await service.signup(user)
    doc = await service.user.findOneAndUpdate({account: user.account}, {nick: 'jeff234'})
    expect(doc).toBeTruthy()
  })

  test('create user', async () => {
    await init()
    let doc = await service.user.create(user)
    try {
      doc = await service.user.create(user)
    } catch (e) {

    }
  })

  test('signup cb', async () => {
    init().then(function () {
      service.signup(user, function (err, doc) {
        log(err, doc)
        expect(err === null).toBeTruthy()
      })
    })
  })

  test('signup', async () => {
    init().then(function () {
      service.signup(user)
        .then(function (doc) {
          expect(doc !== null).toBeTruthy()
          return service.signup(user)
        })
        .catch(function (err) {
          log(err)
          expect(err !== null).toBeTruthy()
        })
    })
  })

  test('findUser account', async () => {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
        service.findUser(doc.uid, function (err, doc) {
          log(err, doc)
          expect(doc.account === user.account).toBeTruthy()
          service.findUser(doc.id, function (err, doc) {
            log(err, doc)
            expect(doc.account === user.account).toBeTruthy()
          })
        })
      })
    })
  })

  test('findUser email', async () => {
    prepare().then(function () {
      service.findUser(user.email, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
      })
    })
  })

  test('findUser mobile', async () => {
    prepare().then(function () {
      service.findUser(user.mobile, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
      })
    })
  })

  test('updateUser cb', async () => {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
        service.updateUser(doc.id, {password: '123', gender: 'man'}, function (err, doc) {
          log(err, doc)
          expect(!err && doc).toBeTruthy()
        })
      })
    })
  })

  test('updateUser', async () => {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
        service.updateUser(doc.id, {password: '123', gender: 'man'})
          .then(function (doc) {
            expect(doc).toBeTruthy()
          })
      })
    })
  })

  test('updateUserExt', async () => {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
        service.updateUserExt(doc.id, {title: 'engineer'}, function (err, doc) {
          log(err, doc)
          expect(err === null).toBeTruthy()
        })
      })
    })
  })

  test('updatePassword', async () => {
    prepare().then(function () {
      service.findUser(user.account, function (err, doc) {
        log(err, doc)
        expect(doc.account === user.account).toBeTruthy()
        let id = doc.id
        service.updateUser(doc.id, {password: '123'}, function (err, doc) {
          log(err, doc)
          expect(err === null).toBeTruthy()
          service.updatePassword(id, user.password, '1234', function (err, doc) {
            log(err, doc)
            expect(doc && !doc.err).toBeTruthy()
            service.signon(user.account, '1234', function (err, doc) {
              log(err, doc)
              expect(doc && doc.id !== null).toBeTruthy()
            })
          })
        })
      })
    })
  })

  test('signon', async () => {
    prepare().then(function () {
      service.findUser(user.account)
        .then(function (doc) {
          return service.updateUser(doc.id, {password: '123'})
        })
        .then(function (doc) {
          return service.signon(user.account, user.password)
        })
        .then(function (doc) {
          expect(doc && doc.id).toBeTruthy()
        })
        .catch(function (err) {
          log(err)
        })
    })
  })

  test('signon cb', async () => {
    prepare().then(function () {
      service.findUser(user.account)
        .then(function (doc) {
          return service.updateUser(doc.id, {password: '123'})
        })
        .then(function (doc) {
          service.signon(user.account, user.password, function (err, doc) {
            log(err, doc)
            expect(doc && doc.id).toBeTruthy()
          })
        })
        .catch(function (err) {
          log(err)
        })
    })
  })

  test('avatar save', async () => {
    prepare().then(function () {
      service.avatar
        .save('123', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAeCAMAAACMnWmDAAAAGFBMVEUAAABQUFAAAAAAAAAAAAAAAAAAAAAAAABiRp8mAAAACHRSTlMA/wAAAAAAACXRGJEAAAmJSURBVHjaAX4JgfYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAQEBAQEAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEAAQEBAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQEAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAAEBAQEBAAAAAAAAAAEBAQAAAAABAQEAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAQEAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFAgGM9lrxNwAAAABJRU5ErkJggg==')
        .then(function (doc) {
          expect(doc).toBeTruthy()
          console.log(service.avatar.get('123'))
        })
    })
  })
})
