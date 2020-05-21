import ssh2 from 'ssh2'
import crypto from 'crypto'
import { inspect } from 'util'
import glob from 'glob'
import fs from 'fs'
import { spawn, execSync } from 'child_process'
import path from 'path'

const { Server, utils } = ssh2

const allowedUser = Buffer.from('git')
const hostKey = {
  key: fs.readFileSync('host.key'),
  passphrase: 'foobar'
}
const options = {
  hostKeys: [hostKey],
  banner: 'Connecting to server2'
}
const clientKeys = glob
  .sync('keys/*.pub')
  .map(path => fs.readFileSync(path))

const port = process.env.PORT || 22755
const address = process.env.ADDRESS || 'localhost'

const server = new Server(options, client => {
  console.log('Client connected')

  client
    .on('authentication', ctx => {
      const user = Buffer.from(ctx.username)

      if (user.length == allowedUser.length && crypto.timingSafeEqual(user, allowedUser) && ctx.method == 'publickey') {
        const { key } = ctx

        // TODO: Security!!!!!! Compare keys

        return ctx.accept()
      }

      return ctx.reject()
    })
    .on('ready', () => {
      console.log('Client ready')

      client.on('session', (accept, reject) => {
        console.log('Client session started')
        const session = accept()

        session.once('exec', (accept, reject, info) => {
          console.log(`Client wants to execute: ${inspect(info.command)}`)
          const stream = accept()

          const [command, arg] = info.command.split(' ')
          const repo = path.resolve('./repos/' + arg.replace(/(^')|('$)/g, '').replace(/^\//, ''))

          if (!fs.existsSync(repo)) {
            execSync(`git init --bare ${repo}`)
          }

          console.log(`Repo: ${repo}`)

          const child = spawn(command, [repo])

          stream.stdout.pipe(child.stdin)
          child.stdout.pipe(stream.stdin, { end: false })
          child.stderr.pipe(stream.stderr)

          child.on('exit', code => {
            stream.exit(code)
            stream.end()
          })
        })
      })
    })
    .on('end', () => {
      console.log('Client disconnected')
    })
})

server.listen(port, address, function() {
  console.log(`Listening on port: ${this.address().port}`)
})
