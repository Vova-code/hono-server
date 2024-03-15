import { createClient } from 'redis'
import { Resend } from 'resend'
import LOGGER from './utils/logger'
import { BrokerMessage } from './@types'

const resendClient = new Resend('re_E3gaZP7L_M24jEkHXJWnPyxPRqo3hX9w8')
export const redisClient = createClient({ password: 'mypassword' })

export const redisConsumer = redisClient.duplicate()
export const redisPublisher = redisClient.duplicate()

await redisConsumer.connect()
await redisPublisher.connect()

await redisConsumer.subscribe('mail', async (message) => {
  const messageContent = JSON.parse(message) as BrokerMessage

  const { data, error } = await resendClient.emails.send({
    from: 'delivered@resend.dev',
    to: ['vdoche@live.fr'],
    subject: 'Hono server using Bun',
    html: `<div><h1>This is a test mail</h1><h3>Using redis as message broker with content:</h3>
            <div>
              <span>TO: ${messageContent.to}</span>
              <span>FROM: ${messageContent.from}</span>
              <span>CONTENT: ${messageContent.content}</span>
            </div></div>`,
  })

  if (error) {
    LOGGER.error('Error while attempt to send mail')
  } else {
    LOGGER.info('Email sent', data)
  }
})

redisClient.on('error', (err: unknown) => {
  LOGGER.error('Redis client error', err)
})

await redisClient.connect()
