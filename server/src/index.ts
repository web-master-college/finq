import { app } from './app.js'

const port = 3000

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

server.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
