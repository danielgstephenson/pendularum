import { Server as SocketIoServer } from 'socket.io'
import { Server } from './server'
import { World } from 'planck'

export class Game {
  world = new World()
  io: SocketIoServer

  timeScale = 1

  constructor (server: Server) {
    this.timeScale = server.config.timeScale
    this.io = server.io
    this.io.on('connection', socket => {
      console.log('connect:', socket.id)
      socket.emit('connected')
      socket.on('click', () => {
        // console.log('click')
      })
      socket.on('disconnect', () => {
        console.log('disconnect:', socket.id)
      })
    })
  }
}
