import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions'
import { Router } from 'itty-router'
import { JsonResponse } from './helpers'
import commands from './commands'

export interface FetchEnv {
  DISCORD_PUBLIC_KEY: string
  DISCORD_APPLICATION_ID: string
  POLLS: KVNamespace
}

const router = Router()

router.post('/', async (request, env) => {
  if (!request.json) {
    return new Response('Bad Request', { status: 400 })
  }
  const message = await request.json()
  if (message.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    })
  }

  if (message.type === InteractionType.APPLICATION_COMMAND) {
    const commandName: string = message.data.name.toLowerCase()
    if (Object.prototype.hasOwnProperty.call(commands, commandName)) {
      return new JsonResponse(
        await commands[commandName].APPLICATION_COMMAND(message, env),
      )
    }
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
  }

  if (message.type === InteractionType.MESSAGE_COMPONENT) {
    const commandName: string = message.message.interaction.name.toLowerCase()
    if (
      Object.prototype.hasOwnProperty.call(commands, commandName) &&
      typeof commands[commandName].MESSAGE_COMPONENT === 'function'
    ) {
      const func = commands[commandName].MESSAGE_COMPONENT
      if (func) {
        return new JsonResponse(await func(message, env))
      }
    }
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
  }
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

export default {
  async fetch(request: Request, env: FetchEnv): Promise<Response> {
    if (request.method === 'POST') {
      const signature = request.headers.get('x-signature-ed25519') || ''
      const timestamp = request.headers.get('x-signature-timestamp') || ''
      const body = await request.clone().arrayBuffer()
      const isRequestValid = verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY,
      )
      if (!isRequestValid) {
        return new Response('Bad request signature.', { status: 401 })
      }
    }

    return router.handle(request, env)
  },
}
