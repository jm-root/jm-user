const $ = require('./service')

let user = {
  account: 'jeff',
  password: '123',
  mobile: '13600000000',
  email: 'jeff@jamma.cn',
  nick: 'jeff'
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
  test('router', async () => {
    let doc = await prepare()
    doc = await router.get('/users', {rows: 2})
    console.log(doc)
    expect(doc.page).toBeTruthy()
  })
})
