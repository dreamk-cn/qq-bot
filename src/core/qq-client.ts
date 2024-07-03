import { WebSocket, type Server } from 'ws';
import EventEmitter from 'events';
const { WS_HOST = '', WS_PORT = '', WS_PATH = '' } = process.env;

export interface Message {
  type: 'text' | 'image';
  data: {
    text: string;
    [key: string]: string | null;
  };
}

export interface QQMessage {
  self_id: number;
  user_id?: number;
  time: number;
  message_type: 'private' | 'group';
  raw_message: string;
  font: number;
  sub_type: string;
  message: Message[];
  message_format: string;
  post_type: 'meta_event' | 'message';
}

interface RequestData {
  action: 'send_private_msg' | 'send_group_msg' | 'send_msg';
  params: JSON;
  echo?: string;
}

class QQClient extends EventEmitter {
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

  private handleConnection(ws: WebSocket) {
    this.ws = ws;
    this.emit('connection');
    ws.on('message', (data) => {
      const qqMessage: QQMessage = JSON.parse(data.toString('utf-8')) as QQMessage;
      console.log(qqMessage);
      if (qqMessage.post_type === 'message')
        this.emit('message', qqMessage);
    });

    ws.on('close', () => {
    });

    ws.on('error', () => {

    });
  }

  private messageFormat(data: Object) {
    return JSON.stringify(data);
  }

  // 通用的发送消息方法
  public sendMessage(data: Object) {
    if (!this.ws) {
      return;
    }
    this.ws.send(this.messageFormat(data));
  }

  public sendGroupMessage(data: { message: string, groupId: number, userId?: number }) {
    const { message, groupId } = data;
    const requestData = {
      action: 'send_group_msg',
      params: {
        group_id: groupId,
        message,
      },
    };
    this.sendMessage(requestData);
  }

  public sendPrivateMessage(data: { message: string, userId: number }) {
    const { message, userId } = data;
    const requestData = {
      action: 'send_private_msg',
      params: {
        user_id: userId,
        message,
      },
    };
    this.sendMessage(requestData);
  }

}

// 只能有一个实例
export default QQClient.getInstance;