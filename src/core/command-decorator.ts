// command-decorator.ts
import { Message, CommandHandler, CommandRule, CommandPriority, CommandBlock } from './types';
import qqClient from '@/core/qq-client';

// 命令注册器的更新需支持更多元数据
export class CommandRegistry {
  private static handlers: Array<{
    command: string | RegExp,
    rule: CommandRule,
    handler: CommandHandler,
    aliases: string[],
    priority: CommandPriority,
    block: CommandBlock
  }> = [];

  static register(command: string | RegExp, handler: CommandHandler, rule: CommandRule = () => true, aliases: string[] = [], priority: CommandPriority = 1, block: CommandBlock = false) {
    let inserted = false;
    for (let i = this.handlers.length - 1; i >= 0; i--) {
      if ((this.handlers[i].priority ?? 1) > (priority ?? 1)) {
        this.handlers.splice(i + 1, 0, {
          rule,
          command,
          handler,
          aliases,
          priority,
          block,
        });
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.handlers.unshift({ rule, command, handler, aliases, priority, block });
    }
  }

  /**
   * 分发消息到命令处理器
   * @param message 消息对象
   * @returns 处理结果
   */
  static async dispatch(message: Message) {
    for (const { command, handler, rule, aliases, block } of this.handlers) {
      const formatMessage = qqClient.formatRawMessage(message.raw_message);
      if (
        (typeof command === 'string' && formatMessage.startsWith(command)) ||
        (command instanceof RegExp && command.test(formatMessage))
      ) {
        if (rule(message)) {
          const response = await handler(message);
          if (block) return response; // 如果需要阻塞，则处理完后直接返回
        }
      } else if (aliases.some(alias => formatMessage.startsWith(alias))) {
        if (rule(message)) {
          const response = await handler(message);
          if (block) return response;
        }
      }
    }
    return '未找到匹配的命令';
  }
}

export function onCommand(
  command: string | RegExp,
  rule: CommandRule = () => true,
  aliases: string[] = [],
  priority: CommandPriority = 1,
  block: CommandBlock = false,
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as CommandHandler;

    console.log(`装饰器开始处理方法: ${String(propertyKey)}`);

    // 注册命令处理器，同时传递额外参数
    CommandRegistry.register(command, originalMethod, rule, aliases, priority, block);

    return descriptor;
  };
}

