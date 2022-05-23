import { FetchEnv } from '../server'
import poll from './poll'
import { InteractionType, MessageComponentTypes } from 'discord-interactions'

interface ObjectType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface Commands {
  APPLICATION_COMMAND: (message: ApplicationCommandMessage, env: FetchEnv) => ObjectType
  MESSAGE_COMPONENT?: (message: MessageComponentMessage, env: FetchEnv) => ObjectType
  APPLICATION_COMMAND_AUTOCOMPLETE?: (
    message: MessageComponentMessage,
    env: FetchEnv,
  ) => ObjectType
  MODAL_SUBMIT?: (message: MessageComponentMessage, env: FetchEnv) => ObjectType
}

const commands: { [key: string]: Commands } = {
  poll,
}

export default commands

export const DISCORD_COMMANDS = [
  {
    name: 'ping',
    description: 'Simple ping pong response',
  },
  {
    name: 'test',
    description: 'Test message components',
  },
  {
    name: 'poll',
    description: 'Create a poll',
    options: [
      {
        name: 'question',
        description: 'Poll question',
        required: true,
        type: 3,
      },
      {
        name: 'answers',
        description: 'Poll answers (separated by `;`)',
        required: true,
        type: 3,
      },
    ],
  },
]

interface ApplicationCommandMessageOptions {
  name: string
  type: number
  value: string | boolean | number
}

export interface ApplicationCommandMessage {
  application_id: string
  channel_id: string
  data: {
    id: string
    name: string
    type: InteractionType
    options?: Array<ApplicationCommandMessageOptions>
  }
  guild_id: string
  guild_locale: string
  id: string
  locale: string
  member: {
    avatar: string | null
    communication_disabled_until: number | null
    deaf: boolean
    flags: number
    is_pending: boolean
    joined_at: string
    mute: boolean
    nick: string | null
    pending: boolean
    permissions: string
    premium_since: string | null
    roles: Array<unknown>
    user: {
      avatar: string
      avatar_decoration: string | null
      discriminator: string
      id: string
      public_flags: number
      username: string
    }
  }
  token: string
  type: InteractionType
  version: number
}

export interface DiscordMessage {
  application_id: string
  attachments: Array<unknown>
  author: {
    avatar: string
    avatar_decoration: string | null
    discriminator: string
    bot?: boolean
    id: string
    public_flags: number
    username: string
  }
  channel_id: string
  components?: Array<unknown>
  content: string
  edited_timestamp: string | null
  embeds: Array<unknown>
  flags: number
  id: string
  interaction: {
    id: string
    name: string
    type: InteractionType
    user: {
      avatar: string
      avatar_decoration: string | null
      discriminator: string
      id: string
      public_flags: number
      username: string
    }
  }
  mention_everyone: boolean
  mention_roles: Array<unknown>
  mentions: Array<unknown>
  pinned: boolean
  timestamp: string
  tts: boolean
  type: number
  webhook_id: string
}

export interface MessageComponentMessage
  extends Omit<ApplicationCommandMessage, 'data'> {
  data: {
    component_type: MessageComponentTypes
    custom_id: string
    values?: Array<string>
  }
  message: DiscordMessage
}
