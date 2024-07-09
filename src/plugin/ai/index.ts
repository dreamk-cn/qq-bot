import sendMessageToSpark, { type SparkMessage } from './spartk-http';
import { onCommand } from '@/core/command-decorator';
import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import Config  from '@/config';

const MAX_TOKENS = 4096;

const messages: SparkMessage[] = [ ...Config.BOT_PRESET ];
export default class AI {
  name = '讯飞星火AI大模型';

  currentTokenSize: number = 0;

  async figureOutCurrentTokenSize() {
    const { choices, usage } =  await sendMessageToSpark({ messages, model: 'generalv3' });
  }
  
  @onCommand('', (message) => qqClient.isChatWithBot(message), [], 1, true)
  async handle(message: Message): Promise<boolean> {
    const question = qqClient.formatRawMessage(message.raw_message);
    if (question.length > 200) {
      const isHandle = await qqClient.sendMessage({
        message: '哥们，说这么多话，太复杂了！简化一下再来问我吧', userId: message.user_id, 
        groupId: message.message_type === 'group' ? message.group_id : 0,
        id: message.message_id,
      });
      return isHandle;
    }
    try {
      messages.push({ role: 'user', content: question });
      const { choices, usage } = await sendMessageToSpark({ messages, model: 'generalv3' });
      const response = choices[0].message.content;
      messages.push({ role: 'assistant', content: response });
      console.log('请求消耗：', usage);
      console.log('ai回复内容：', response);
      const isHandle = await qqClient.sendMessage({
        message: response, userId: message.user_id, 
        groupId: message.message_type === 'group' ? message.group_id : 0,
        id: message.message_id,
      });
      return isHandle;
    } catch (error) {
      throw error;
    }
  }
}
