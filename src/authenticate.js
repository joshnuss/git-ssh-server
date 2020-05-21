import fs from 'fs'
import glob from 'glob'
import crypto from 'crypto'

const allowedUser = Buffer.from('git')
const clientKeys = glob
  .sync('keys/*.pub')
  .map(path => fs.readFileSync(path))

export default function authenticate(ctx) {
  const user = Buffer.from(ctx.username)

  if (user.length == allowedUser.length && crypto.timingSafeEqual(user, allowedUser) && ctx.method == 'publickey') {
    const { key } = ctx

    if (isValidKey(key)) {
      return ctx.accept()
    }
  }

  ctx.reject()
}

function isValidKey(key) {
  // TODO: Security!!!!!! Compare keys

  return true
}

