import { spawn } from 'node:child_process';
import hotData from './hotData';
import { createInterface } from 'node:readline/promises';
import { fileExist, Color } from 'ismi-node-tools';
const { stdin, stdout, stderr } = process;

/** 杀死那个进程 */
export async function killChild() {
  return new Promise<void>((resolve, reject) => {
    // 清理父传子消息
    stdin.removeListener('data', parentToChild);
    // 清理子传父
    hotData.childProcess &&
      hotData.childProcess.stdout &&
      hotData.childProcess.stdout.removeListener('data', childToParent);
    // 倘若有子程序 id
    if (hotData.childProcess && hotData.childProcess.pid) {
      const id: number = hotData.childProcess.pid;
      /// 软关闭
      // hotData.childProcess.kill('SIGTERM');
      process.kill(id, 'SIGTERM');
      console.log(`kill  one on ${new Date().toTimeString()} `);
      setTimeout(() => {
        // process.kill(id, 'SIGKILL');
        // process.kill(id, 'SIGKILL');
        // process.kill(id, 'SIGKILL');
        // process.kill(id, 'SIGKILL');
        // process.kill(id, 'SIGKILL');
        // process.kill(id, 'SIGKILL');
        // hotData.childProcess.kill('SIGKILL');
        console.log(`kill  two  on ${new Date().toTimeString()} `);
        setTimeout(() => {
          /// 最后通牒
          // process.kill(id, 'SIGKILL');
          // hotData.childProcess.kill('SIGKILL');
          resolve();
        }, 1200);
      }, 4000);
      hotData.childProcess.on('exit', (code, signal) => {
        console.log(`i am die in ${new Date().toTimeString()} `);
      });
    } else {
      resolve();
    }
  });
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
        stdio: ['pipe', 'pipe', 'pipe'],
        // stdio: [stdin, stdout, stderr],
      },
    );
    hotData.childProcess.stdout.on('data', childToParent);
    stdin.on('data', parentToChild);
  } catch (error) {
    console.log(error, '\n 创建子线程失败');
  }
}
/** 子进程向父进程写入 */
function childToParent(data: Buffer) {
  stdout.write(data.toString());
}

/** 父进程向子进程写入 */
function parentToChild(data: Buffer) {
  hotData.childProcess.stdin.write(data.toString());
}
