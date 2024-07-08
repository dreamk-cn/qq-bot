import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import { onCommand } from '@/core/command-decorator';
import { random } from '@/util/random';

function extractDiceRoll(input: string): { x?: number, y?: number } {
  const pattern = /^\/d\s+(\d+)-(\d+)$/;
  const match = input.match(pattern);
  
  if (match) {
    const x = parseInt(match[1], 10); // 面数
    const y = parseInt(match[2], 10); // 骰子数
    
    return { x, y };
  } else {
    return {
      x: 6,
      y: 1,
    };
  }
}

export default class Dice {
  name = '超级骰子';

  @onCommand('/d', () => true, [], 50, true)
  async handle(question: Message): Promise<boolean> {
    return new Promise(async (resolve) => {
      const content = qqClient.formatRawMessage(question.raw_message);
      try {
        const { x = 6, y = 11 } = extractDiceRoll(content);
        let sum = 0;
        let detail = '';
        let isBest = true;
        let isLow = true;
        for (let i = 0; i < y; i++) {
          const num = random(1, x);
          if (isBest && num === x) isBest = true; else isBest = false;
          if (isLow && num === 1) isLow = true; else isLow = false;
          if (y <= 10) {
            detail += `\n第${i + 1}个骰子的点数为${num}点。`;
          }
          sum += num;
        }
        isLow = isLow && y >= 10 && x >= 6;
        isBest = isBest && y >= 10 && x >= 6;
        const response = `${isBest ? '天选之子！全都是最大点数\n' : ''}${isLow ? '霉运之子？全都是最小点数\n' : ''}你投出了${y}个${x}面的骰子，共计${sum}点。${detail.length ? detail : '骰子太多，就不展示细节啦~'}`;
        qqClient.sendMessage({ message: response, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
        resolve(true);
      } catch (error) {
        resolve(false);
        throw error;
      }
    });
  }

  @onCommand('/d help', () => true, [], 50, true)
  async handleHelp(question: Message): Promise<boolean> {
    qqClient.sendMessage({
      message: '骰子功能使用说明...',
      userId: question.user_id,
      groupId: question.message_type === 'group' ? question.group_id : 0,
    });
    return true;
  }
}
