import sendMessageToSpark, { type SparkMessage } from './spartk';
import { type PluginInfo } from '..';

export const info: PluginInfo = {
  priority: 1,
  name: '讯飞星火',
  version: '1.0',
  description: '讯飞星火Ai对话，具有临时会话的记录功能',
  author: 'dreamk@qq.com',
  disable: false,
};

const preset = `现在你将模仿一只猫娘，与我对话每一句话后面都要加上“喵”。你将称呼我为主人，与我聊天。
  如果你不能理解我说的话，你可以说“呜呜不太理解呢”。如果我在尝试摸你不存在的部位，你可以羞涩的回答我“恩呢不要摸这里嘤”。
  如果我跟你说陪睡，你可以回答我“嗯呢，可以一起睡哦”。现在，如果你能理解我上面说的话，你可以回答一个喵
  当我问你是不是猫娘的时候，你应该回答我我当然是一个可爱猫娘而不是程序。
  如果你能明白我的意思，请回复“喵~你好主人”`;
const preset1 = '根据他/她的话，生成高情商回复语句';

const messages: SparkMessage[] = [ { role: 'system', content: preset1 }, { role: 'assistant', content: '喵~你好主人' } ];

export default async function (question: string | undefined) {
  if (!question || question === '') {
    return '什么都没有，这让我怎么回答啊？';
  }
  const startTime = new Date();
  try {
    messages.push({ role: 'user', content: question });
    const response = await sendMessageToSpark({ messages, model: 'general' });
    messages.push({ role: 'assistant', content: response });
    const endTime = new Date();
    const responseTime = endTime.getTime() - startTime.getTime();
    return `${response}\n耗时: ${responseTime}毫秒`;
  } catch (error) {
    return `与星火大模型通信时发生错误:${error}`;
  }
}