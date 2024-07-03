import QQClient, { type QQMessage } from './core/qq-client';
const qqClient = QQClient();
import { loadPlugins } from './plugin';
import Ai from './plugin/ai';

console.log(process.env.NODE_ENV);

const pluginList = [];

qqClient.on('connection', async () => {
  const list = await loadPlugins();
  list.forEach((plugin) => {
    console.log(`加载插件《${plugin.name}》成功！，插件作者: ${plugin.author}`);
    pluginList.push(plugin);
  });
  console.log('所有插件已经加载完毕！');
});

qqClient.on('message', async (data: QQMessage) => {
  console.log('接收message：', data);
  if (data.message_type === 'private') {
    const question = data.message.filter((item) => item.type === 'text');
    console.log(question);
    console.log('消息内容', data.message[0].data.text);
    const message = await Ai(data.message[0].data.text);
    console.log('回复内容', message);
    qqClient.sendPrivateMessage({ userId: data.user_id as number, message: message });
  } else {
    const question = data.message.filter((item) => item.type === 'text');
    console.log(question);
    console.log('消息内容', data.message[0].data.text);
    const res = await Ai(data.message[0].data.text);
    console.log('回复内容', res);
    qqClient.sendMessage(res);
  }
});
