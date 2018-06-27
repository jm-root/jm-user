const $ = require('./service')

let user = {
  account: 'jeff',
  password: '123',
  mobile: '13600000000',
  email: 'jeff@jamma.cn',
  nick: 'jeff',
  ext: {
    a: 123,
    o: {
      name: 123,
      b: 345
    },
    o1: 456,
    aa: [1, 2],
    ao: [{a: 1}, {b: 1}]
  }
}
let ext = {
  a: 1234,
  o: {
    name: 1234,
    b: 3456
  },
  o2: {
    m: '222',
    n: 1
  },
  aa: [1, 3],
  ao: [{a: 2}, {c: 1}]
}

let router = null
let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
  router = $.router()
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
  test('list', async () => {
    let doc = await prepare()
    doc = await router.get('/users', {rows: 2})
    console.log(doc)
    expect(doc.page).toBeTruthy()
  })

  test('update ext', async () => {
    let doc = await prepare()
    let id = doc.id
    doc = await router.post(`/users/${id}/ext`, ext)
    console.log(doc)
    expect(doc.ret).toBeTruthy()
    doc = await router.get(`/users/${id}`)
    console.log('updateUserExt merge: \n%s', JSON.stringify(doc, null, 2))
  })

  test('update ext replace', async () => {
    let doc = await prepare()
    let id = doc.id
    doc = await router.post(`/users/${id}/extreplace`, ext)
    console.log(doc)
    expect(doc.ret).toBeTruthy()
    doc = await router.get(`/users/${id}`)
    console.log('updateUserExt extreplace: \n%s', JSON.stringify(doc, null, 2))
  })

  test('update ext assign', async () => {
    let doc = await prepare()
    let id = doc.id
    doc = await router.post(`/users/${id}/extassign`, ext)
    console.log(doc)
    expect(doc.ret).toBeTruthy()
    doc = await router.get(`/users/${id}`)
    console.log('updateUserExt extassign: \n%s', JSON.stringify(doc, null, 2))
  })
})
