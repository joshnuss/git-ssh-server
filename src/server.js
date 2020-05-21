import ssh2 from 'ssh2'
import fs from 'fs'
import auth from './auth.js'
import session from './session.js'

const { Server, utils } = ssh2

const hostKey = {
  key: fs.readFileSync('host.key'),
  passphrase: 'foobar'
}

const options = {
  hostKeys: [hostKey]
}

export default new Server(options, client => {
  console.log('client:connected')

  client
    .on('authentication', auth)
    .on('ready', () => {
      console.log('client:ready')
      client.on('session', session)
    })
    .on('end', () => {
      console.log('client:disconnect')
    })
})
