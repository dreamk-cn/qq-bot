import 'dotenv/config';
import qqClient from './core/qq-client';

import AI from './plugin/ai';
import DICE from './plugin/dice';
import D5 from './plugin/d5';

qqClient.on('connection', async () => {
  qqClient.registerMessageHandler(new AI);
  qqClient.registerMessageHandler(new DICE);
  qqClient.registerMessageHandler(new D5);
  console.log('所有插件已经加载完毕！');
});
