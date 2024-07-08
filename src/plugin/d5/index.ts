import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import { onCommand } from '@/core/command-decorator';
import Cron from 'node-cron';

const Survivor: string[] = [ '律师', '"囚徒"', '医生', '"小女孩"', '啦啦队员', '调香师', '佣兵', '"心理学家"'];
const Hunter: string[] = [ '厂长', '鹿头', '小丑', '杰克', '蜘蛛', '宿伞之魂'];

function getRandomElement(arr: string[]) {
  if (arr.length === 0) {
    return '';
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

export default class D5 {
  name = 'D5';

  crons: Cron.ScheduledTask[] = [];

  constructor() {
    this.crons.push(Cron.schedule('* * 12,19 * * *', () => {
      console.log('identify 5 cron!');
      qqClient.sendPrivateMessage({ message: '时间经不起等待，第五人格启动!', userId: 1633051172 });
    }));
  }

  @onCommand('随机监管者', () => true, [], 50, true)
  async handleHunter(question: Message): Promise<boolean> {
    try {
      let response = getRandomElement(Hunter);
      qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
      return true;
    } catch (error) {
      throw error;
    }
  }

  @onCommand('随机求生者', () => true, [], 50, true)
  async handleSurvivor(question: Message): Promise<boolean> {
    try {
      const response = getRandomElement(Survivor);
      qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
      return true;
    } catch (error) {
      throw error;
    }
  }

}
