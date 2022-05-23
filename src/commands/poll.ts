import { ApplicationCommandMessage, Commands, MessageComponentMessage } from '.'
import { FetchEnv } from '../server'

const Poll: Commands = {
  APPLICATION_COMMAND: async (
    message: ApplicationCommandMessage,
    env: FetchEnv,
  ) => {
    const options = Object.fromEntries(
      message.data.options?.map((option) => [option.name, option.value]) || [],
    )
    const question = options['question']
    const answers = (options['answers'] as string).split(';')
    await env.POLLS.put(
      message.id.toString(),
      JSON.stringify({
        owner: message.member.user.id,
        answers,
        votes: [],
      }),
      {
        expirationTtl: 7 * 24 * 60 * 60,
      },
    )
    return {
      type: 4,
      data: {
        content: `<@${message.member.user.id}> asked: ${question}`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: 'poll_answer',
                options: answers.map((answer, i) => ({
                  label: answer,
                  value: i,
                })),
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'End Poll',
                style: 4,
                custom_id: 'end_poll',
              },
            ],
          },
        ],
      },
    }
  },
  MESSAGE_COMPONENT: async (
    message: MessageComponentMessage,
    env: FetchEnv,
  ) => {
    const action = message.data.custom_id
    const data = JSON.parse(
      (await env.POLLS.get(message.message.interaction.id.toString())) || '{}',
    )
    if (action === 'end_poll' && data.owner === message.member.user.id) {
      return {
        type: 7,
        data: {
          content: message.message.content,
          components: [],
        },
      }
    }
    if (action === 'poll_answer') {
      const selectedValue = message.data.values ? message.data.values[0] : null
      if (
        data.votes.filter(
          (vote: { id: string }) => vote.id === message.member.user.id,
        ).length < 1
      ) {
        data.votes.push({
          id: message.member.user.id,
          value: parseInt(selectedValue || '-1'),
        })
      } else {
        const originalAnswer = data.votes.filter(
          (vote: { id: string }) => vote.id === message.member.user.id,
        )[0]['value']
        const newAnswer = parseInt(selectedValue || '-1')
        if (originalAnswer === newAnswer) {
          data.votes = data.votes.filter(
            (vote: { id: string }) => vote.id !== message.member.user.id,
          )
        } else {
          data.votes.filter(
            (vote: { id: string }) => vote.id === message.member.user.id,
          )[0]['value'] = newAnswer
        }
      }
    }
    const content = [
      message.message.content.split('\n')[0],
      ...data.votes.map(
        (vote: { id: string; value: number }) =>
          `<@${vote.id}> answered: ${data.answers[vote.value]}`,
      ),
    ]
    await env.POLLS.put(message.message.interaction.id, JSON.stringify(data), {
      expirationTtl: 7 * 24 * 60 * 60,
    })
    console.log(data)
    return {
      type: 7,
      data: {
        content: content.join('\n'),
        components: message.message.components,
      },
    }
  },
}

export default Poll
