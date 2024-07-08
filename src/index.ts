import 'dotenv/config';
import qqClient from '@/core/qq-client';

import AI from './plugin/ai';
import D5 from './plugin/d5';
import Dice from './plugin/dice';

qqClient.on('connection', async () => {
  new AI();
  new D5();
  new Dice();
  console.log('与go-cqhttp的连接已建立');
});
