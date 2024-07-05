
import { Message } from './types';
const { BOT_QQ = '' } = process.env;

// 工厂
function createDecorator(conditionChecker: (message: Message) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (message: Message) {
      if (conditionChecker(message)) {
        return originalMethod.call(this, message);
      }
    };
    return descriptor;
  };
}

// 检测是否指定和bot聊天，私聊or群里@bot
export function OnAt() {
  return createDecorator((message: Message) => {
    if (message.message_type === 'private') {
      return true;
    } else if (message.raw_message.includes(`[CQ:at,qq=${BOT_QQ}]`)) {
      return true;
    } else {
      return false;
    }
  });
}

// 检查消息是否符合特定规则
export function OnCommand(command: string) {
  return createDecorator((message) => message.raw_message.startsWith(command));
}

