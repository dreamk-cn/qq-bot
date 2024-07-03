import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import crypto from 'crypto';
const { APP_ID = '', API_SECRET = '', API_KEY = '' } = process.env;

interface SparkResponse {
  header :{
    code: number
    message: string
    sid: string
    status: number
  }
  payload:{
    choices:{
      status: number
      seq: number
      text: {
        content: string
        role: string
        index: string
      }[]
    },
    usage?:{
      text:{
        question_tokens: number
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
    }
  }
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type Events = 'message' | 'error' | 'close' | 'open' | 'complete';

class Spark extends EventEmitter {
  private static instance: Spark | null = null;

  private wss: WebSocket;

  private historyMessage: Message[] = [];

  private message = '';

  constructor() {
    super();
    const signUrl = this.getSignUrl();
    this.wss = new WebSocket(signUrl);
    this.wss.on('open', () => {
      this.emit('open');
    });
    this.wss.on('error', (err) => {
      this.emit('error', err);
    });
    this.wss.on('message', (data: Buffer) => {
      this.handleMessage(data);
    });
    this.wss.on('close', () => {
      this.emit('close');
    });
  }

  // 获取用于登录的signUrl
  private getSignUrl() {
    const dateString = new Date().toUTCString();
    const host = 'spark-api.xf-yun.com';
    const path = '/v1.1/chat';
    const tmp = `host: ${host}\ndate: ${dateString}\nGET ${path} HTTP/1.1`;
    const signature = crypto.createHmac('sha256', API_SECRET).update(tmp).digest('base64');
    const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const buff = Buffer.from(authorizationOrigin);
    const authorization = buff.toString('base64');
    const signUrl = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(dateString)}&host=${host}`;
    return signUrl;
  }

  public static getInstance(): Spark {
    if (!Spark.instance) {
      Spark.instance = new Spark();
    }
    return Spark.instance;
  }

  public sendMessage(content: string):void {
    this.historyMessage.push({ role: 'user', content });
    if (this.wss.readyState === WebSocket.OPEN) {
      this.wss.send(
        JSON.stringify({
          header: { app_id: APP_ID },
          parameter: {
            chat: {
              domain: 'general',
              temperature: 0.5,
              max_tokens: 4096,
            },
          },
          payload: {
            message: {
              text: this.historyMessage,
            },
          },
        }),
      );
    }
  }

  private handleMessage(data: Buffer): void {
    const message = JSON.parse(data.toString()) as SparkResponse;
    const texts = message.payload.choices.text;
    const usage = message.payload.usage;
    texts.forEach((item) => {
      this.message += item.content;
      this.emit('message', item.content);
    });
    // 如果是最后一句话则清空message
    if (usage) {
      this.historyMessage.push({
        role: 'system',
        content: this.message,
      });
      this.emit('complete', this.message);
      this.message = '';
    }
  }


  onEvent(event: Events, callback: (content: string) => void):void {
    this.on(event, callback);
  }

  public getMessage(): string {
    return this.message;
  }

  public getHistoryMessage(): Message[] {
    return this.historyMessage;
  }
}

 
// 导出 initUrl 函数
export default Spark;