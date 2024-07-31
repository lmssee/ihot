import { log } from 'node:console';
/**
 * 该文件为开发文件，仅在开发环境使用。用于开发的热更新
 */
import { watch, statSync } from 'node:fs';
import { throttle } from 'ismi-js-tools';
import hotData from './hotData';
import initOptions from './initOptions';
import { createChild, killChild } from './chidManage';
import { beforeRestart } from './beforeRestart';
import { Color, pathJoin } from 'ismi-node-tools';
import checkSkip from './checkSkip';
/**
 * 一个简单的热启动
 */
export default class HotDevelop {
  /** Initialize project
   *
   * 初始化项目
   */
  constructor(args: any) {
    this.run();
    /** Changes in listening configuration files
     *
     *  监听配置文件的变化
     */
    watch('.', { persistent: false, recursive: true }, this.configChange);
    // 初始化参数（起动命令后手动添加的参数）
    hotData.initArg = args;
  }

  /**
   * 开始执行热重启
   * @param [restart=false] {@link Boolean} 类型，用于是否初始化配置项及更新监听
   */
  async run(restart = true) {
    // 锁定更新
    hotData.restart = true;
    // 初始化配置
    restart && (await initOptions());
    // 食子虎
    await killChild();
    // 开始允许代码
    await beforeRestart();
    // 创建子线程
    createChild();
    // 解锁
    hotData.restart = false;
    // 开启监听
    restart && this.hot();
  }

  /** 开热监听文件变化并执行热更新 */
  hot(): Boolean {
    let watchFileList: string[] = hotData.options.watch;
    // 根据新的监听者么清理旧已移除的监听者
    Object.keys(hotData.listeners).map((currentLi: string) => {
      // 参看该元素是否已存在于原上一次设定
      const elementIndex = watchFileList.indexOf(currentLi);
      // 执行清理
      if (elementIndex == -1) {
        hotData.listeners[currentLi].close();
        delete hotData.listeners[currentLi];
      } else {
        // 移除已经存在的监听
        watchFileList.splice(elementIndex, 1);
      }
    });
    // 每一个需要（在上一步仍存在的元素）监听的文件
    for (let key in watchFileList) {
      const _ele = watchFileList[key];
      const _temp: string = pathJoin(hotData.options.base, _ele);
      if (Object.prototype.hasOwnProperty.call(watchFileList, key)) {
        if (statSync(_temp as any, { throwIfNoEntry: false })) {
          hotData.listeners[_temp] = watch(
            _temp as any,
            { persistent: false, recursive: true },
            (type: string, filename: any) => {
              /** 检验是否跳过 */
              if (checkSkip(filename)) return;
              /// 上一次未结束
              if (hotData.restart)
                // 由于在 windows 上更改一个文件会触发多次同文件的 change，这里做一个筛选
                return hotData.changeFileInfo.filename != filename;
              // 正常进入
              this.reLodeCode(type, filename, _ele);
            },
          );
        } else {
          console.log(
            Color.yellow(
              `    ${_temp} 文件不存在，请查看配置文件中 watch 属性  ${_temp} 是否正确 `,
            ),
          );
        }
      }
    }
    return true;
  }
  /** 监听回到 */
  /** 热更新回调 */
  reLodeCode = throttle(
    (type: string, filename: string, watchTarget: string) => {
      //  设置更改文件信息，用于执行 `beforeRestart`
      hotData.changeFileInfo = { type, watchTarget, filename };
      const [time, day] = getTime();
      console.log(
        '第'
          .concat(Color.cyan((++hotData.count).toString()))
          .concat(Color.green('次加载'))
          .concat(Color.red(time))
          .concat('-')
          .concat(Color.yellow(day)),
      );
      this.run(false);
    },
    2000,
  );

  /** 配置文件发生变化 */
  configChange = throttle((type: string, fileName: string) => {
    if (!/miconfig\.(ts|js|json)/.test(fileName)) return;
    const [time] = getTime();
    console.log(Color.cyan(time).concat(Color.darkGreen('   配置文件更新')));
    this.run();
  }, 800);
}

/** 获取时间 */
function getTime() {
  const now = new Date();
  return [now.toLocaleTimeString(), now.toLocaleDateString()];
}
