import { spawn } from 'node:child_process';
import hotData from './hotData';
import { createInterface } from 'node:readline/promises';
import { fileExist, Color } from 'ismi-node-tools';
const { stdin, stdout, stderr } = process;

const rl = createInterface({
  input: stdin,
  output: stdout,
});

/** 杀死那个进程 */
export function killChild() {
  !hotData.childProcess?.killed && hotData.childProcess?.kill();
}

/** 创建子程序 */
export async function createChild() {
  let cwd = hotData.options.cwd;
  const cwdExit = fileExist(cwd);
  if (!cwdExit || !cwdExit.isDirectory()) {
    return console.log(
      Color.darkBlue(`配置中 cwd（目录） :  ${Color.darkYellow(cwd)} 不存在`),
    );
  }

  // cwd = pathJoin(process.cwd(), cwd);
  try {
    hotData.childProcess = spawn(
      (hotData.options.code as string) || hotData.ls,
      [...hotData.options.args],
      {
        shell: true,
        cwd,
        stdio: [stdin, stdout, stderr],
      },
    );
  } catch (error) {
    console.log(error, '\n 创建子线程失败');
  }
}
