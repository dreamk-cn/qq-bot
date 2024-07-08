// 消息, 消息发送, 请求, 通知, 或元事件
export type PostType = 'message' | 'message_sent' | 'request' | 'notice' | 'meta_event';

// 每种消息都会附带这个信息
interface Base {
  time: number;
  self_id: number;
  post_type: PostType;
}

// 用户发送的消息
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

// 私聊消息和群聊消息的共同点
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

// 指令处理器 for command 装饰器
export type CommandHandler = (message: Message) => Promise<string>;
export type CommandRule = (message: Message) => boolean;
export type CommandPriority = number;
export type CommandBlock = boolean;