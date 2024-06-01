import { runOtherCode } from "@lmssee/node-tools";
import hotData from "./hotData";

/** 执行代码之前其他的操作  */
export async function beforeRestart() {
    const __beforeRestart: any = hotData.options.beforeRestart;
    if (!__beforeRestart) return;
    for (const key in __beforeRestart) {
        /** 测试是哪个文件发生了变化 */
        if (new RegExp(`${key}`).test(hotData.changeFileInfo.fileName)) {
            try {
                await runOtherCode({
                    code: __beforeRestart[key],
                    cwd: hotData.options.base.concat(key)
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
}