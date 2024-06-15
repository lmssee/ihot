import HotDevelop from 'src/hot';
import { initConfig } from 'src/actions/initConfig';
import command from 'src/actions/command';
const { stdin } = process;
import type { ArgMapType } from './src/types';

// 获取用户输入参数

// 获取 JSON 格式的参数
const argMap: ArgMapType =
  process.argv.slice(2).length == 0 ? {} : command.args.$map;

if (argMap.init) {
  // 只打包 es module ，所以在顶端运用了 await
  await initConfig(argMap.init);
} else {
  new HotDevelop(argMap);
  // 保持主线程活跃
  stdin.on('data', data => null);
}
