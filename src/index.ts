import { Hono } from 'hono'
import { redisPublisher } from './lib/redisClient'
import { faker } from '@faker-js/faker'
import { prettyJSON } from 'hono/pretty-json'
import LOGGER from './lib/utils/logger'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import { basicAuth } from 'hono/basic-auth'


const app = new Hono()
const customLogger = (message: string, ...rest: string[]) => {
  LOGGER.info(message, ...rest)
}

app.use(
  logger(customLogger),
  basicAuth({
    username: process.env.APP_USER ?? '',
    password: process.env.APP_PASSWORD ?? 'myBad_LowStrengthPassword',
  }),
  prettyJSON(),
  poweredBy(),
)
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

app.on(['GET', 'POST'], '/event', async c => {
  try {
    await redisPublisher.publish(
      'mail',
      JSON.stringify({
        to: faker.internet.email(),
        from: 'admin@hono.com',
        content: faker.lorem.paragraph({ min: 2, max: 6 }),
      }),
    )
    return c.json({
      message: 'Message have been dispatched ✅',
    })
  } catch (e) {
    // @ts-ignore
    LOGGER.warn(e.message)
    c.status(500)
    return c.json({ message: 'Error attempting to dispatch message ❌' })
  }
})

app.get('/health', (c) => {
  return c.json({
    message: 'Bun app is running !',
  })
})

app.get('/', c => {
  return c.html('<main>Hello App on Bun runtime 🧁</main>')
})

export default {
  port: 3001,
  fetch: app.fetch,
  async queue(batch: unknown, _: unknown) {
  },
}
