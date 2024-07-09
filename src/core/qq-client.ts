import { WebSocket, Server, RawData } from 'ws';
import { Message, RequestData } from '@/core/types';
import { CommandRegistry } from '@/core/command-decorator';
import config from '@/config/index';
import { EventEmitter } from 'events';


const { WS_HOST = '', WS_PORT = '', WS_PATH = '', BOT_QQ = '' } = process.env;
const { BOT_NAME } = config;

export class QQClient extends EventEmitter {
  static instance: QQClient | null = null;

  private wss: Server;

  private ws: WebSocket | null = null;

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

  // 处理连接
  private handleConnection(ws: WebSocket) {
    this.ws = ws;
    this.emit('connection');
    // 监听消息
    ws.on('message', (data) => this.handleMessage(data));
  }

  // 处理消息
  private async handleMessage(data: RawData) {
    const message: Message = JSON.parse(data.toString('utf-8')) as Message;
    if (message.post_type === 'message') {
      console.log('接收到消息', message.raw_message);
      CommandRegistry.dispatch(message);
    }
  }

  // 格式化消息
  private messageFormat(data: Object) {
    return JSON.stringify(data);
  }

  // 通用的发送消息方法
  public async send(data: RequestData): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ws) {
        return resolve(false);
      }
      console.log('发送消息', data);
      this.ws.send(this.messageFormat(data), error => {
        if (error) {
          console.log('发送消息失败：', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
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

  // 自动判断发送群消息还是私聊消息
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

  ///////////////////////////////////////////////////////////////////////////////////
  // 分割线
  ///////////////////////////////////////////////////////////////////////////////////

  /*
  * 移除消息中的CQ码
  */
  public removeCQCodes(message: string): string {
    // 正则表达式匹配CQ码，包括[CQ:开头，中间任意非]字符，直到遇到]
    const cqCodeRegex = /\[CQ:[^\]]*\]/g;
    // 使用空字符串替换匹配到的CQ码，从而剔除它们
    return message.replace(cqCodeRegex, '');
  }

  // 判断字符串中有没有@BOT
  public isAtBot(message: string) {
    return message.includes(`[CQ:at,qq=${BOT_QQ}]`);
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

  /**
   * 格式化消息
   * @param message
   * @returns 移除CQ码和BOT名字开头后的消息
   */
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

export default QQClient.getInstance();
