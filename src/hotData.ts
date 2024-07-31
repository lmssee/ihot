import { ChildProcess, ChildProcessWithoutNullStreams } from 'child_process';
import { typeOf } from 'ismi-js-tools';
import { ChildProcessByStdio } from 'node:child_process';
import { FSWatcher } from 'node:fs';
/**
 * 初始化的参数们
 */
let initArg: any = {};
class HotData {
  /** 是否是 windows   */
  isWindows: boolean = process.platform == 'win32';
  /** 这会是否正在更新 */
  restart: boolean = false;

  /** 初始化的参数们
   *
   * 该值的初始化在 [主文件](./hot.ts)
   */
  get initArg(): any {
    return initArg;
  }

  set initArg(v) {
    initArgData(v);
  }

  /** 展示目录  */
  get ls(): string {
    return this.isWindows ? 'dir' : 'ls';
  }

  /** 计数  */
  count: number = 0;

  /** 配置文件名称 */
  configFileName = '';
  /** 改变的信息
   *
   * 该属性主要存在于 [主文件](./hot.ts)
   *
   * 用于储存当前更新的文件，用于在 [更新前处理文件](beforeRestart.ts) 使用
   */
  changeFileInfo = {
    /** 被监听者 */
    watchTarget: '',
    /** 更改的具体文件 */
    filename: '',
    /** 更改的类型 */
    type: '',
  };
  /** 开启的子线程
   *
   *
   * 该属性主要操作存在于 [子线程管理文件](./childManage.ts) 中进行操作
   */
  childProcess!: ChildProcessWithoutNullStreams;
  childList!: ChildProcessWithoutNullStreams[];
  /** 用户启动时的参数 */
  // args?: string[];
  /** 配置信息
   *
   *  该属性会在 [初始化配置文件](./initOptions.ts)中进行赋值
   */
  options!: DefineOptions;
  /**   监听者们
   *
   *  由于之前疏忽于监听文件的监听未释放问题，可能会导致内存泄漏，
   * 现设置监听者，在监听者发生变更时触发进行清理与避免已监听文件的重复监听
   */
  listeners: { [key: string]: FSWatcher } = {};
  /**
   * 退出的时间
   *
   * 用于检测是否为连续点击 Ctrl + C
   *
   * 以在下次点击时退出程序
   *
   */
  existTime: number = Date.now();

  /** 整理数据  */
  manage() {
    Object.defineProperties(this, {
      options: {
        value: this.options,
        writable: true,
        enumerable: false,
        configurable: false,
      },
      childProcess: {
        value: this.childProcess,
        writable: true,
        enumerable: false,
        configurable: false,
      },
    });
  }
}

/** 初始化初始化数据 */
function initArgData(v: any) {
  if (typeOf(v) != 'object') return;
  // 配置 base
  typeof v.base == 'string' && (initArg.base = v.base),
    // 配置 cwd
    typeof v.cwd == 'string' && (initArg.cwd = v.cwd),
    // 配置 watch 数组模式
    (typeOf(v.watch) == 'array' && (initArg.watch = v.watch)) ||
      // 配置 watch 字符串模式
      (typeof v.watch == 'string' && (initArg.watch = [v.watch])),
    // 配置 code
    typeof v.code == 'string' && (initArg.code = v.code),
    // 配置跳过文件
    (typeOf(v.skip) == 'string' && (v.skip = [v.skip]), 0) ||
      (typeOf(v.skip) == 'array' &&
        (initArg.skip = new RegExp(v.skip.join('|').replace(/\./gm, '\\.')))),
    // 配置其余参数
    (typeof v.args == 'string' && (v.args = [v.args]), 0) ||
      (typeOf(v.args) == 'array' && (initArg.args = v.args));
}

/** 热重启配置 */
export interface DefineOptions {
  /**  监听文件的相对目录  */
  base: string;
  /**  执行的相对位置  */
  cwd: string;
  /** 热重启监听文件 */
  watch: string[];
  /** 跳过不监听的文件夹 */
  skip: RegExp;
  /**  执行的 code 码，要被热启动的原命令 */
  code: string | null | undefined;
  /** 配置热更新启动参数 */
  args: any[];
  /** 移除旧的打包文件 */
  remove: Boolean;
  /** 热启动前需要执行的操作  */
  beforeRestart: {};
}

export default new HotData();
