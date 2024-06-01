/**
 * 该文件为开发文件，仅在开发环境使用。用于开发的热更新
 */
import { watch, statSync } from "node:fs";
import { throttle } from "@lmssee/tools";
import hotData from "./hotData";
import initOptions from "./initOptions";
import { createChild, killChild } from "./chidManage";
import { beforeRestart } from "./beforeRestart";
import { Color, t } from "lmcmd";
/**
 * 一个简单的热启动
 */
class HotDevelop {
    /** 热更新回调 */
    reLodeCode = throttle((type: string, fileName: string, fileParent: string) => {
        //  设置更改文件信息，用于执行 `beforeRestart` 
        hotData.changeFileInfo = { type, fileName: fileParent };
        // 为指认跳过文件
        if (hotData.options.skip.test(fileName)) return;
        const [time, day] = getTime();
        console.log(Color.lightBlack((++hotData.count).toString())
            .concat(Color.darkGreen("restart"))
            .concat(Color.darkRed(time))
            .concat('-')
            .concat(Color.darkYellow(day))
        );
        this.run(false)
    }, 2000);

    /** 配置文件发生变化 */
    configChange = throttle((type: string, fileName: string) => {
        if (!/lmconfig\.(ts|js|json)/.test(fileName)) return;
        const [time] = getTime();
        console.log(Color.cyan(time).concat(Color.darkGreen('   配置文件更新')));
        this.run();
    }, 800);

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

        hotData.initArg = args;
    }

    /**
     * 开始执行热重启
     * @param [restart=false] {@link Boolean} 类型，用于是否初始化配置项及更新监听
     */
    async run(restart = true) {
        killChild();
        // 初始化配置
        restart && await initOptions();
        // 开始允许代码
        await beforeRestart();
        createChild();
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
            const _temp: string = hotData.options.base.concat(_ele);
            if (Object.prototype.hasOwnProperty.call(watchFileList, key)) {
                if (statSync(_temp as any, { throwIfNoEntry: false })) {
                    hotData.listeners[_temp] = watch(_temp as any, { persistent: false, recursive: true }, (type: string, fileName: any) => (this.reLodeCode(type, fileName, _ele), undefined))
                }
                else {
                    console.log(Color.yellow(`    ${_temp} 文件不存在，请查看配置文件中 watch 属性  ${_temp} 是否正确 `))
                }
            }
        }
        return true;
    }
}

function getTime() {
    const now = new Date();
    return [now.toLocaleTimeString(), now.toLocaleDateString()];
}

export default HotDevelop;