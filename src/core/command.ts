export class Subscriber {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  receiveMessage(message: string) {
    console.log(`${this.name}接收消息: ${message}`);
  }
}


export class Publisher {
  private subscribers: Subscriber[] = [];

  addSubscriber(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  removeSubscriber(subscriber: Subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  sendMessage(message: string) {
    console.log(`发布者发送消息: ${message}`);
    for (const subscriber of this.subscribers) {
      subscriber.receiveMessage(message);
    }
  }
}