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

// 定义权限枚举
enum Permissions {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

// 权限装饰器
function requirePermission(permission: Permissions) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 假设这里有一个全局变量或从某个地方获取的用户权限
      const currentUserPermissions: Permissions[] = [ Permissions.READ, Permissions.WRITE];

      // 检查当前用户是否拥有所需权限
      if (!currentUserPermissions.includes(permission)) {
        return;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

class BlogService {
  currentUserPermissions: Permissions[] = [Permissions.READ, Permissions.WRITE]; // 示例权限

  // 使用装饰器来保护方法
  @requirePermission(Permissions.WRITE)
  publishArticle(article: string) {
    console.log(`Publishing article: "${article}"`);
  }

  @requirePermission(Permissions.ADMIN)
  deleteArticle(articleId: number) {
    console.log(`Deleting article with ID ${articleId}`);
  }
}

// 实例化服务
const blogService = new BlogService();

try {
  blogService.publishArticle('New Article Content'); // 应该成功，因为用户有'write'权限
  blogService.deleteArticle(123); // 应该抛出错误，因为用户没有'admin'权限
} catch (error) {
  console.error('catch error: ', error);
}