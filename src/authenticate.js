import fs from 'fs'
import glob from 'glob'
import crypto from 'crypto'
import ssh2 from 'ssh2'

const { utils } = ssh2

const allowedUser = Buffer.from('git')
const clientKeys = glob
  .sync('keys/*.pub')
  .map(path => fs.readFileSync(path))
  .map(data => {
    const publicKey = utils.parseKey(data)
    const publicSSHKey = publicKey.getPublicSSH()

    return { publicKey, publicSSHKey }
  })

export default function authenticate(ctx) {
  const user = Buffer.from(ctx.username)

  if (user.length == allowedUser.length && crypto.timingSafeEqual(user, allowedUser) && ctx.method == 'publickey') {
    if (isValidKey(ctx)) {
      console.log('auth:success')
      return ctx.accept()
    }
  }

  console.log('auth:fail')
  ctx.reject()
}

function isValidKey({key, blob, signature}) {
  return !!clientKeys.find(({ publicKey, publicSSHKey }) =>
    key.algo == publicKey.type
    && key.data.length == publicSSHKey.length
    && crypto.timingSafeEqual(key.data, publicSSHKey)
    && (!signature || publicKey.verify(blob, signature))
  )
}
