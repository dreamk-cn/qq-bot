import sendMessageToSpark, { type SparkMessage } from './spartk-http';
import { Message, Plugin } from '../../core/types';
import { QQClient } from '../../core/qq-client';
import config  from '../../config';
const { BOT_PRESET } = config;

const messages: SparkMessage[] = [ ...BOT_PRESET ];

export default class AI implements Plugin {
  name = '讯飞星火AI大模型';

  priority = 1;

  async handle(question: Message, qqClient: QQClient): Promise<boolean> {
    console.log('AI插件开始处理消息');
    return new Promise(async (resolve) => {
      if (!qqClient.isChatWithBot(question)) {
        return resolve(false);
      }
      try {
        const content = qqClient.removeCQCodes(question.raw_message);
        messages.push({ role: 'user', content });
        const startTime = new Date();
        const response = await sendMessageToSpark({ messages, model: 'general' });
        const endTime = new Date();
        const responseTime = endTime.getTime() - startTime.getTime();
        messages.push({ role: 'assistant', content: response });
        console.log(`AI对话耗时: ${responseTime}毫秒。对话内容：${content}`);
        qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
        resolve(true);
      } catch (error) {
        throw error;
      }
    });
  }
}
