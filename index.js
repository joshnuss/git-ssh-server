import ssh2 from 'ssh2'
import fs from 'fs'
import authenticate from './src/authenticate.js'
import session from './src/session.js'

const { Server, utils } = ssh2

const port = process.env.PORT || 22755
const address = process.env.ADDRESS || 'localhost'
const hostKey = {
  key: fs.readFileSync('host.key'),
  passphrase: 'foobar'
}
const options = {
  hostKeys: [hostKey]
}

const server = new Server(options, client => {
  console.log('client:connected')

  client
    .on('authentication', authenticate)
    .on('ready', () => {
      console.log('client:ready')
      client.on('session', session)
    })
    .on('end', () => {
      console.log('client:disconnect')
    })
})

server.listen(port, address, function() {
  const {address, port} = this.address()

  console.log(`server:listen ${address}:${port}`)
})
