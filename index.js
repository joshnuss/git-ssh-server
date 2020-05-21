import server from './src/server.js'

const port = process.env.PORT || 22755
const address = process.env.ADDRESS || 'localhost'

server.listen(port, address, function() {
  const {address, port} = this.address()

  console.log(`server:listen ${address}:${port}`)
})
