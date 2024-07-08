import sendMessageToSpark, { type SparkMessage } from './spartk-http';
import { onCommand } from '@/core/command-decorator';
import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import Config  from '@/config';
const { BOT_PRESET } = Config;

const messages: SparkMessage[] = [ ...BOT_PRESET ];

export default class AI {
  name = '讯飞星火AI大模型';

  @onCommand('', () => true, [], 1, true)
  async handle(question: Message): Promise<boolean> {
    try {
      const content = qqClient.formatRawMessage(question.raw_message);
      messages.push({ role: 'user', content });
      const startTime = new Date();
      const response = await sendMessageToSpark({ messages, model: 'generalv3' });
      const endTime = new Date();
      const responseTime = endTime.getTime() - startTime.getTime();
      messages.push({ role: 'assistant', content: response });
      console.log(`AI对话耗时: ${responseTime}毫秒。对话内容：${content}`);
      qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
