
import { Message } from './types';
import qqClient, { QQClient } from './qq-client';
import config from '../config/index';
const { BOT_NAME, BOT_QQ } = config;

// 工厂
function createDecorator(conditionChecker: (message: Message) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (message: Message, qC: QQClient) {
      if (conditionChecker(message)) {
        return originalMethod.call(this, message, qC);
      } else {
        return false;
      }
    };
    return descriptor;
  };
}

// 检测是否指定和bot聊天，私聊or群里@bot
export function OnChatToBot() {
  return createDecorator((message: Message) => {
    if (message.message_type === 'private') {
      return true;
    } else if (message.raw_message.includes(`[CQ:at,qq=${BOT_QQ}]`) || message.raw_message.startsWith(BOT_NAME)) {
      return true;
    } else {
      return false;
    }
  });
}

// 检查消息是否符合特定规则
export function OnCommand(commands: (string | RegExp)[]) {
  return createDecorator((message) => {
    // 对于每个命令或正则表达式，检查消息是否匹配
    return commands.some((command) => {
      if (typeof command === 'string') {
        return qqClient.formatRawMessage(message.raw_message).startsWith(command);
      } else {
        return command.test(message.raw_message);
      }
    });
  });
}

// 检查是否是群聊消息
export function OnGroup() {
  return createDecorator((message) => message.message_type === 'group');
}

// 检查是否是私聊消息
export function OnPrivate() {
  return createDecorator((message) => message.message_type === 'private');
}


