import fs from 'fs';
import path from 'path';

export interface PluginInfo {
  name?: string;
  description?: string;
  author?: string;
  version?: string;
  priority?: number;
  disable?: boolean;
}

interface Plugin extends PluginInfo {
  name: string;
  priority: number;
  execute: Function;
}

export async function loadPlugins(): Promise<Plugin[]> {
  const pluginDirectory = path.join(__dirname, './');
  const plugins: Plugin[] = [];
  const isDev = process.env.NODE_ENV === 'development';
  const fileNname = isDev ? 'index.ts' : 'index.js';
  try {
    const files = fs.readdirSync(pluginDirectory);
    for (const file of files) {
      if (file !== fileNname) {
        // 动态导入插件
        const pluginModule = await import(path.join(pluginDirectory, file, fileNname));
        // 插件需要是默认导出，这样方便自动导入
        const plugin = pluginModule.default as Function | undefined;
        const pluginInfo = pluginModule.info as PluginInfo | undefined;
        if (typeof plugin === 'function') {
          plugins.push({
            name: pluginInfo?.name || file,
            execute: plugin,
            priority: pluginInfo?.priority || 0,
            disable: pluginInfo?.disable || false,
            author: pluginInfo?.author || '无',
          });
        }
      }
    }
    plugins.sort((a, b) => b.priority - a.priority);
  } catch (err) {
    throw err;
  }
  return plugins;
}