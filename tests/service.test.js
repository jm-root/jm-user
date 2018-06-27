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
    expect(doc.id).toBeTruthy()
    try {
      doc = await service.user.create(user)
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('signup', async () => {
    await init()
    let doc = await service.signup(user)
    expect(doc !== null).toBeTruthy()
    try {
      doc = await service.signup(user)
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('findUser account', async () => {
    await prepare()
    let doc = await service.findUser(user.account)
    expect(doc.account === user.account).toBeTruthy()
    doc = await service.findUser(doc.uid)
    expect(doc.account === user.account).toBeTruthy()
  })

  test('findUser email', async () => {
    await prepare()
    let doc = await service.findUser(user.email)
    expect(doc.account === user.account).toBeTruthy()
  })

  test('findUser mobile', async () => {
    await prepare()
    let doc = await service.findUser(user.mobile)
    expect(doc.account === user.account).toBeTruthy()
  })

  test('updateUser', async () => {
    await prepare()
    let doc = await service.findUser(user.account)
    expect(doc.account === user.account).toBeTruthy()
    doc = await service.updateUser(doc.id, {password: '123', gender: 'man'})
    expect(doc).toBeTruthy()
  })

  test('updateUserExt', async () => {
    await prepare()
    let doc = await service.findUser(user.account)
    expect(doc.account === user.account).toBeTruthy()
    doc = await service.updateUserExt(doc.id, {title: 'engineer'})
    expect(doc).toBeTruthy()
  })

  test('updatePassword', async () => {
    await prepare()
    let doc = await service.findUser(user.account)
    expect(doc.account === user.account).toBeTruthy()
    let id = doc.id
    doc = await service.updateUser(doc.id, {password: '123'})
    doc = await service.updatePassword(id, user.password, '1234')
    expect(doc && !doc.err).toBeTruthy()
    doc = await service.signon(user.account, '1234')
    expect(doc && doc.id !== null).toBeTruthy()
  })

  test('signon', async () => {
    await prepare()
    let doc = await service.findUser(user.account)
    doc = await service.updateUser(doc.id, {password: '123'})
    doc = await service.signon(user.account, user.password)
    expect(doc && doc.id).toBeTruthy()
  })

  test('avatar save', async () => {
    await prepare()
    let doc = await service.avatar
      .save('123', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAeCAMAAACMnWmDAAAAGFBMVEUAAABQUFAAAAAAAAAAAAAAAAAAAAAAAABiRp8mAAAACHRSTlMA/wAAAAAAACXRGJEAAAmJSURBVHjaAX4JgfYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAABAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAQEBAQEAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEAAQEBAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQEAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAQEAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAAAAAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAAEBAQEBAAAAAAAAAAEBAQAAAAABAQEAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAQEAAAAAAAAAAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEAAAAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFAgGM9lrxNwAAAABJRU5ErkJggg==')
    expect(doc).toBeTruthy()
  })
})
