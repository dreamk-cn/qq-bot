// 消息, 消息发送, 请求, 通知, 或元事件
export type PostType = 'message' | 'message_sent' | 'request' | 'notice' | 'meta_event';

interface Base {
  time: number;
  self_id: number;
  post_type: PostType;
}

export interface MessageDetail {
  type: 'text' | 'image';
  data: {
    [key: string]: string | null;
  };
}

// 消息发送者
export interface Sender {
  user_id: number;
  nickname: string;
  sex: 'male' | 'female' | 'unknown';
  age: number;
}

// 群消息发送者
export interface GroupSender extends Sender {
  group_id: number;
}

interface BaseMessage extends Base {
  post_type: 'message';
  message_type: 'private' | 'group';
  sub_type: string;
  message_id: number;
  user_id: number;
  message: MessageDetail[];
  raw_message: string;
  font: number;
  sender: Sender;
}

// 私聊消息
export interface PrivateMessage extends BaseMessage {
  post_type: 'message';
  message_type: 'private';
  sub_type: 'friend' | 'group' | 'group_self' | 'other';
  message_id: number;
  sender: Sender;
  target_id: number;
  temp_source: number;
}

// 群聊消息
export interface GroupMessage extends BaseMessage {
  post_type: 'message';
  message_type: 'group';
  sub_type: 'normal' | 'anonymous' | 'notice';
  group_id: number;
  sender: GroupSender;
}

// 消息
export type Message = PrivateMessage | GroupMessage;

// 发送请求的数据格式
export interface RequestData {
  action: 'send_private_msg' | 'send_group_msg' | 'send_msg';
  params: {
    [key: string]: string | number;
  };
  echo?: string;
}

export interface Plugin {
  name?: string;
  priority?: number;
  description?: string;
  author?: string;
  version?: string;
  enable?: boolean;
  handle(message: Message, client: QQClient): Promise<boolean>
}