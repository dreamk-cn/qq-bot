import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import { onCommand } from '@/core/command-decorator';
import Cron from 'node-cron';

const Survivor: string[] = [ 
  '律师', '"囚徒"', '医生', '"小女孩"', '啦啦队员', '调香师', '佣兵', '"心理学家"',
  '咒术师', '先知', '祭司', '调酒师', '园丁', '作曲家', '古董商', '空军', '勘探员',
  '杂技演员', '记者', '魔术师', '入殓师', '盲女', '幸运儿', '病患', '画家', '大幅',
  '牛仔', '前锋', '击球手', '昆虫学者', '舞女', '冒险家', '木偶师', '玩具商', '机械师',
  '野人', '"慈善家"', '守墓人', '小说家', '邮差', '教授', '飞行家', '哭泣小丑', '火灾调查员',

];
const Hunter: string[] = [ 
  '红蝶', '宿伞之魂', '渔女', '杰克', '摄影师', '红夫人', '守夜人',
  '鹿头', '梦之女巫', '小丑', '厂长', '噩梦', '愚人金', '使徒', '隐士',
  '歌剧演员', '黄衣之主', '时空之影', '雕刻家', '小提琴家', '孽蜥', '爱哭鬼',
  '博士', '26号守卫', '蜡像师', '蜘蛛', '破轮', '记录员', '疯眼',

];

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
    this.crons.push(Cron.schedule('0 12,19 * * *', () => {
      console.log('identify 5 cron!');
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
