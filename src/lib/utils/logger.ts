import pino from 'pino'

const LOGGER =  pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: new Date(Date.now()).toLocaleString('fr-FR')
    }
  }
})

export default LOGGER
