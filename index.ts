/**
 * 该文件为开发文件，仅在开发环境使用。用于开发的热更新
 */
import { mkdirSync, watch, statSync } from "node:fs";
import { spawn, fork, ChildProcess, ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { debounce } from "@lmssee/tools";
import { runOtherCode, readFiltToJsonSync, fileExist } from "@lmssee/node-tools";
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});
/** 热重启配置 */
interface DefineOptions {
    /** 热重启监听文件 */
    "watch": String,
    /** 跳过不监听的文件夹 */
    "skip": RegExp,
    /**  执行的 code 码，要被热启动的原命令 */
    "code": String | null | undefined,
    /** 配置热更新启动参数 */
    "args": any[],
    /** 移除旧的打包文件 */
    "remove": Boolean,
    /** 热启动前需要执行的操作  */
    "beforRestart": {}
}

/**
 * 一个简单的热启动
 */
class HotDevelop {
    /** 配置文件名称 */
    configFileName = "lmssee.config.json";
    /** 改变的信息 */
    changeFileInfo = {
        fileName: "",
        type: ""
    };
    /** 开启的子线程 */
    childProcess: ChildProcessWithoutNullStreams | undefined;
    /** 用户启动时的参数 */
    args: string[];
    /** 配置信息 */
    options!: DefineOptions;

    constructor() {
        (this.args = process.argv.slice(2)), this.init();
    }
    /**
     * 开始执行热重启
     * @param [restart=false] {@link Boolean} 类型，用于是否为首次
     */
    async init(restart = true) {
        await this.iniOptions();
        await this.runCode();
        this.hot();
    }

    /** 获取自定义配置，这里对用户的自定义配置进行处理 */
    async iniOptions() {
        this.options = {
            watch: ".",
            skip: /es|lib|cjs/,
            remove: true,
            code: "",
            args: [],
            beforRestart: {},
        };
        // await this.getConfigFile(); // TODO 暂时不处理
        /** 获取配置文件 */
        const op = readFiltToJsonSync(this.configFileName).hot;
        if (!op) return console.log('\x1b[38;2;215;84;85m 您未配置配置文件，即将为您自动启动默认配置\x1b[m');
        // 自定义配置处理
        op.watch = this._optionToArray(op.watch);
        op.skip = this._optionToArray(op.skip);
        op.skip = !op.skip ? null : new RegExp(op.skip.concat(this.configFileName).join("\|").replace(/\./mg, "\\\."));
        const _temp = op.code ? op.code.replace(/\s{2,}/mg, ' ').split(' ') : [];
        let __temp: string | any[];
        [op.code, ...__temp] = _temp;
        /** #00ffff TODO 这里本应有  this.args 的处理  */
        op.args = op.args ? __temp.concat(op.args) : __temp;
        op.remove = !(op.remove == false);
        const options: any = this.options;
        for (const key in options) (Object.prototype.hasOwnProperty.call(options, key)) && op[key] && (options[key] = op[key]);
        Object.defineProperties(this, {
            "options": {
                value: this.options,
                writable: true,
                enumerable: false,
                configurable: false
            },
            "childProcess": {
                value: this.childProcess,
                writable: true,
                enumerable: false,
                configurable: false
            },
            "args": {
                value: this.args,
                writable: true,
                enumerable: false,
                configurable: false
            }
        }), Object.preventExtensions(this), Object.seal(this);
        return true;
    }

    /** 获取配置文件
     * 
     * TODO （该方法暂时未使用）
     * 
     * @param [samsara=1]  循环调用次数 ，用于递归调用
     */
    async getConfigFile(samsara = 1): Promise<any> {
        let tsConfig = !(fileExist("lmssee.config.ts") == undefined), jsConfig = !(fileExist('lmssee.config.js') == undefined), jsonConfig = !(fileExist("lmssee.config.json") == undefined);
        if (tsConfig) {
            if (!fileExist('node_modules/.lmssee')) {
                mkdirSync("node_modules/.lmssee");
                if (--samsara) return this.getConfigFile(5);
            }
            await runOtherCode("npx tsc  lmssee.config.ts    --outDir  node_modules/.lmssee");
        }
    }

    /** 处理配置单输入转化为数组  */
    _optionToArray(o: any) {
        return !o && null || typeof o == 'string' && [o] || Array.isArray(o) && o || null;
    }

    /**  执行清理 */
    async runCode() {
        await this.beforRestart();
        this.createChild();
    }

    /** 执行代码之前处理 */
    async beforRestart() {
        const __beforRestart: any = this.options.beforRestart;
        if (!__beforRestart) return;
        for (const key in __beforRestart) {
            if (new RegExp(`^${key}`).test(this.changeFileInfo.fileName)) {
                try {
                    await runOtherCode(__beforRestart[key]);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    /** 创建子程序 */
    createChild() {
        try {
            this.childProcess = spawn(this.options.code as string || "ls", [...this.options.args]);
            process.stdin.on("keypress", this.keyPressCallfn);
            this.childProcess.stdout?.on('data', this.stdoutDataCallFn);
            this.childProcess.stderr.on("data", this.stdoutDataCallFn)
        } catch (error) {
            console.log(error, "\n 创建子线程失败");
        }
    }


    /** 开热监听文件变化并执行热更新 */
    hot(): Boolean {
        let watchFileList: any = this.options.watch;
        for (const key in watchFileList)
            Object.prototype.hasOwnProperty.call(watchFileList, key) && statSync(watchFileList[key] as any, { throwIfNoEntry: false }) ?
                watch(watchFileList[key] as any, { persistent: false, recursive: true }, this.reLodeCode) : console.log(`\x1b[38;2;125;125;255m  ${watchFileList[key]} 文件不存在，无法创建对该文件${watchFileList[key]}正常监听\x1b[m]`);
        watch('.', { persistent: false, recursive: true }, this.configChange);
        return true;
    }

    /** 热更新回调 */
    reLodeCode = debounce((type: string, fileName: string) =>
        this.options.skip.test(fileName) || (!this.childProcess?.killed && this.killChild(), console.log(`\x1b[35m${new Date().toLocaleTimeString()}\x1b[m`), this.runCode()), 800);

    /** 配置文件发生变化 */
    configChange = debounce((type: string, fileName: string) => (this.changeFileInfo = { type, fileName }) && (/lmssee\.config\.(ts|js|json)/.test(fileName)) && (!this.childProcess?.killed && this.killChild(), this.init())  /** 更改配置文件  */, 500);

    /** 建立文件树 */
    buildFileTree() { }

    /** 杀死子进程 */
    killChild() {
        process.stdin.removeListener('keypress', this.keyPressCallfn);
        this.childProcess?.stdout.removeListener("data", this.stdoutDataCallFn);
        this.childProcess?.stderr.removeListener("data", this.stdoutDataCallFn);
        this.childProcess?.kill();
    }

    /** 监听 keypress 回调  */
    keyPressCallfn = (keyValue: any, key: any) => {
        (this.childProcess!.stdin as any)?.write(JSON.stringify({ keyValue: keyValue, key: key }));
    }

    /** 监听 stdout data  回调  */
    stdoutDataCallFn = (data: string) => {
        process.stdout.write(data)
    }

}
// 创建实体对象
const hotDevelop = new HotDevelop();
globalThis && !(globalThis as any).lmsseeHotdevelop && Object.defineProperty(globalThis, "lmsseeHotDevelop", {
    value: hotDevelop,
    writable: false,
    enumerable: false,
    configurable: false
})

// 保持主线程活跃
process.stdin.on('data', (data) => null);


/** 
 * 配置文件
 * 
  */
type DefineLmsseeConfig = {


}

export { DefineLmsseeConfig } 