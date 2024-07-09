import 'dotenv/config';
import qqClient from '@/core/qq-client';

qqClient.on('connection', async () => {
  console.log('与go-cqhttp的连接已建立');
  const plugin = await Promise.all([
    import('@/plugin/ai'),
    import('@/plugin/d5'),
    import('@/plugin/dice'),
    import('@/plugin/yes-or-no'),
  ]);
  plugin.forEach(async (p) => {
    new p.default();
  });
  console.log('插件加载完毕');
});
