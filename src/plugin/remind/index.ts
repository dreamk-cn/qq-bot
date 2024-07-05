import { Message, Plugin } from '../../core/types';
import { QQClient } from '../../core/qq-client';
import Cron from 'node-cron';

export default class Remind implements Plugin {
  name = 'Remind';

  priority = 55;

  crons: Cron.ScheduledTask[] = [];

  async handle(question: Message, qqClient: QQClient): Promise<boolean> {
    return new Promise(async (resolve) => {
      const content = qqClient.formateChatWithBot(question.raw_message);
      if (!qqClient.isChatWithBot(question)) {
        return resolve(false);
      }
      try {
        let response = content;
        qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
        resolve(true);
      } catch (error) {
        resolve(false);
        throw error;
      }
    });
  }
}
