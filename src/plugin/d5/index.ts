import { Message, Plugin } from '../../core/types';
import qClient, { QQClient } from '../../core/qq-client';
import { OnChatToBot, OnCommand } from '../../core/decorator';
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

  @OnCommand(['随机监管者', '随机求生者'])
  async handle(question: Message, qqClient: QQClient): Promise<boolean> {
    const content = qqClient.formatRawMessage(question.raw_message);
    console.log(content);
    try {
      let response = '';
      if (content.startsWith('随机求生者')) {
        response = getRandomElement(Survivor);
      } else {
        response = getRandomElement(Hunter);
      }
      qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
