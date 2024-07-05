import { WebSocket, Server, RawData } from 'ws';
import EventEmitter from 'events';
import { Message, RequestData, Plugin } from './types';
import config from '../config/index';
import { HistoryMessage } from '../db/index';

const { WS_HOST = '', WS_PORT = '', WS_PATH = '', BOT_QQ = '' } = process.env;
const { BOT_NAME } = config;

export class QQClient extends EventEmitter {
  static instance: QQClient | null = null;

  private wss: Server;

  private ws: WebSocket | null = null;

  private plugins: Plugin[] = [];

  private historyMessage: HistoryMessage = HistoryMessage.getInstance();

  constructor() {
    super();
    this.wss = new WebSocket.Server({ host: WS_HOST, port: Number(WS_PORT), path: WS_PATH });
    this.wss.on('connection', (ws) => this.handleConnection(ws));
  }

  static getInstance(): QQClient {
    if (!QQClient.instance) {
      QQClient.instance = new QQClient();
    }
    return QQClient.instance;
  }

  private handleConnection(ws: WebSocket) {
    this.ws = ws;
    this.emit('connection');

    ws.on('message', (data) => this.handleMessage(data));
  }

  private async handleMessage(data: RawData) {
    const qqMessage: Message = JSON.parse(data.toString('utf-8')) as Message;
    if (qqMessage.post_type === 'message') {
      this.emit('message', qqMessage);
      this.historyMessage.add(qqMessage.user_id, qqMessage.raw_message, qqMessage.time.toString(), qqMessage.message_type === 'group' ? qqMessage.group_id : undefined);
      await this.distributeMessage(qqMessage);
    }
  }

  // 格式化消息
  private messageFormat(data: Object) {
    return JSON.stringify(data);
  }

  // 通用的发送消息方法
  public send(data: RequestData) {
    if (!this.ws) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { params: { user_id, group_id, message  } } = data;
    this.historyMessage.add(Number(user_id), message.toString(), Math.floor(Date.now() / 1000).toString(), Number(group_id));
    this.ws.send(this.messageFormat(data));
  }

  // 发送群聊消息
  public sendGroupMessage(data: { message: string, groupId: number, userId?: number }) {
    const { message, groupId, userId } = data;
    const requestData: RequestData = {
      action: 'send_group_msg',
      params: {
        group_id: groupId,
        message: userId ? `[CQ:at,qq=${userId}] ${message}` : message,
      },
    };
    console.log(requestData);
    this.send(requestData);
  }

  // 发送私聊消息
  public sendPrivateMessage(data: { message: string, userId: number }) {
    const { message, userId } = data;
    const requestData: RequestData = {
      action: 'send_private_msg',
      params: {
        user_id: userId,
        message,
      },
    };
    this.send(requestData);
  }

  // 自动判断群消息还是私聊消息
  public sendMessage(data: { message: string, userId?: number, groupId?: number }) {
    const { message, userId, groupId } = data;

    if (groupId) {
      if (userId) {
        this.sendGroupMessage({ message, groupId, userId });
      } else {
        this.sendGroupMessage({ message, groupId });
      }
    } else {
      if (userId)
        this.sendPrivateMessage({ message, userId });
    }
  }

  // 允许插件注册消息处理器
  public registerMessageHandler(handler: Plugin) {
    let inserted = false;
    for (let i = this.plugins.length - 1; i >= 0; i--) {
      if ((this.plugins[i].priority ?? 0) > (handler.priority ?? 0)) {
        this.plugins.splice(i + 1, 0, handler);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.plugins.unshift(handler);
    }
  }

  // 在消息事件中分发消息给插件处理
  private async distributeMessage(message: Message) {
    try {
      for (const handler of this.plugins) {
        console.log(handler.name);
        if (!(handler.enable ?? true)) {
          break;
        }
        const isHandle = await handler.handle(message, this);
        console.log(handler.name, isHandle);
        if (isHandle) {
          break;
        }
      }
    } catch (e) {
      this.sendMessage({ message: '出错了~没法回答你这个问题了😭', userId: message.user_id, groupId: message.message_type === 'group' ? message.group_id : undefined });
    }
  }

  public removeCQCodes(message: string): string {
    // 正则表达式匹配CQ码，包括[CQ:开头，中间任意非]字符，直到遇到]
    const cqCodeRegex = /\[CQ:[^\]]*\]/g;
    // 使用空字符串替换匹配到的CQ码，从而剔除它们
    return message.replace(cqCodeRegex, '');
  }

  public isAtBot(message: Message) {
    return message.raw_message.includes(`[CQ:at,qq=${BOT_QQ}]`);
  }

  public isChatWithBot(message: Message) {
    if (message.message_type === 'private') {
      return true;
    } else if (message.raw_message.includes(`[CQ:at,qq=${BOT_QQ}]`) || message.raw_message.startsWith(BOT_NAME)) {
      return true;
    } else {
      return false;
    }
  }

  public isCommand(message: string, rule: RegExp | string) {
    if (typeof rule === 'string') {
      return message.startsWith(rule);
    } else {
      return rule.test(message);
    }
  }

  public formateChatWithBot(message: string) {
    if (message.includes(`[CQ:at,qq=${BOT_QQ}]`)) {
      message = this.removeCQCodes(message);
      if (message.startsWith(BOT_NAME)) {
        message = message.substring(BOT_NAME.length);
      }
    } else if (message.startsWith(BOT_NAME)) {
      message = message.substring(BOT_NAME.length);
    }
    return message.trim();
  }

  public formatRawMessage(message: string) {
    if (message.includes(`[CQ:at,qq=${BOT_QQ}]`)) {
      message = this.removeCQCodes(message);
      if (message.startsWith(BOT_NAME)) {
        message = message.substring(BOT_NAME.length);
      }
    } else if (message.startsWith(BOT_NAME)) {
      message = message.substring(BOT_NAME.length);
    }
    return message.trim();
  }
  
}

// 只能有一个实例
export default QQClient.getInstance();