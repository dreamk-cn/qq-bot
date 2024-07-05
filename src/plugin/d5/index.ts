import { Message, Plugin } from '../../core/types';
import qClient, { QQClient } from '../../core/qq-client';
import Cron from 'node-cron';

const Survivor: string[] = [ '律师', '"囚徒"', '医生', '"小女孩"', '啦啦队员', '调香师', '佣兵', '"心理学家"'];
const Hunter: string[] = [ '厂长', '鹿头', '小丑', '杰克', '蜘蛛', '宿伞之魂'];

function getRandomElement(arr: string[]) {
  if (arr.length === 0) {
    return '';
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

export default class D5 implements Plugin {
  name = 'D5';

  priority = 90;

  crons: Cron.ScheduledTask[] = [];

  constructor() {
    this.crons.push(Cron.schedule('* * 12,19 * * *', () => {
      console.log('identify 5 cron!');
      qClient.sendPrivateMessage({ message: '时间经不起等待，第五人格启动!', userId: 1633051172 });
    }));
  }

  async handle(question: Message, qqClient: QQClient): Promise<boolean> {
    return new Promise(async (resolve) => {
      const content = qqClient.formateChatWithBot(question.raw_message);
      if (!qqClient.isChatWithBot(question)) {
        return resolve(false);
      }
      if (!qqClient.isCommand(content, '随机监管者' ||
        !qqClient.isCommand(content, '随机求生者'))) {
        return resolve(false);
      }
      try {
        let response = '';
        if (qqClient.isCommand(content, '随机求生者')) {
          response = getRandomElement(Survivor);
        } else {
          response = getRandomElement(Hunter);
        }
        qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
        resolve(true);
      } catch (error) {
        resolve(false);
        throw error;
      }
    });
  }
}
