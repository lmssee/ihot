import { pathJoin, runOtherCode } from "ismi-node-tools";
import hotData from "./hotData";

/** 执行代码之前其他的操作  */
export async function beforeRestart() {
  /**  */
  const __beforeRestart: any = hotData.options.beforeRestart;
  if (!__beforeRestart) return;
  for (const key in __beforeRestart) {
    /** 测试是哪个文件 （被监听者） 发生了变化 */
    if (new RegExp(`${key}`).test(hotData.changeFileInfo.watchTarget)) {
      try {
        const reStartBefore = await runOtherCode({
          code: __beforeRestart[key],
          cwd: pathJoin(hotData.options.base, key),
        });
        if (!reStartBefore.success) console.log(reStartBefore.error);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
