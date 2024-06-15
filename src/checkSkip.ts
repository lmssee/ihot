import hotData from './hotData';
/** 检验文件是否为跳过的文件，避免多次触发
 *
 * @param filename   监听者子
 */
export default function checkSkip(filename: string): boolean {
  // 过滤掉 .git 及 node_modules 文件
  return (
    /(^\.)|(\.git)|(node_modules)/.test(filename) ||
    hotData.options.skip.test(filename)
  );
}
