import { Message } from '@/core/types';
import qqClient from '@/core/qq-client';
import { onCommand } from '@/core/command-decorator';
import axios from 'axios';
import { getImagePath } from '@/util/image';


const regex = /(要不要)([\u4e00-\u9fa5]+)/;

export default class D5 {
  name = 'Yes or No';

  @onCommand(regex, () => true, [], 50, true)
  async handle(question: Message): Promise<boolean> {
    try {
      const content = qqClient.formatRawMessage(question.raw_message);
      const match = content.match(regex);
      let que = '';
      if (match && match[2]) {
        que = match[2];
      } else {
        return false;
      }
      const { data } = await axios.get<{ answer: string, forced: false, image: string }>('https://yesno.wtf/api');
      let response = `面对世间难题${que}，你的选择是：${data.answer === 'yes' ? `${que}!` : '还是算了吧' }\n[CQ:image,file=${data.image}]`;
      qqClient.sendMessage({ 
        message: response, userId: question.user_id, 
        groupId: question.message_type === 'group' ? question.group_id : 0,
        id: question.message_id,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  @onCommand('/yes or no', () => true, [], 50, true)
  async handleQuestoiin(question: Message): Promise<boolean> {
    const imagePath = `[CQ:image,file=${getImagePath('plugin/yesOrNo/1.gif')}]`;
    qqClient.sendMessage({ message: imagePath, userId: question.user_id, groupId: question.message_type === 'group' ? question.group_id : 0 });
    return true;
  }

}
