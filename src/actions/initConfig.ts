import { fileExist, pathBasename } from "ismi-node-tools";
import { question } from "ismi-command";
import { writeFileSync } from "node:fs";
import { ArgMapItemType } from "src/types";

let initData = {
  cwd: pathBasename(process.cwd()),
};
/**
 *
 *
 * 初始化配置文件
 */
export async function initConfig(data: ArgMapItemType) {
  // 初始化 js 配置文件
  (data.js && (await testFileExist("js"), 1)) ||
    // 初始化 json 配置文件
    (data.json && (await testFileExist(), 1)) ||
    // 初始化 ts 配置文件
    (data.ts && (await testFileExist("ts"), 1)) ||
    // 未传传输，自动检测并配置文件
    (await noExtension());
}

/** 没有指定配置文件类型  */
async function noExtension() {
  const isExist = ["json", "js", "ts"].find((currentEle: string) => {
    const fileName = `miconfig.${currentEle}`,
      fileInfo = fileExist(fileName);
    return fileInfo && fileInfo?.isFile();
  });

  if (isExist) {
    const tip = ["覆盖", "退出"];
    const result = await question({
      text: "配置文件已存在 ，是否覆盖",
      tip,
      private: true,
    });
    /** 判断是否选择覆盖 */
    if (result == tip[0]) {
      return createConfigFile(isExist);
    }
    console.log("好的，即将退出");
    return setTimeout(() => process.exit(), 800);
  }

  const tip = ["json", "js", "ts", "退出"];

  const result = await question({
    text: "请选择您想初始化的配置文件类型",
    tip,
    resultText: "这一行不该有呀",
    private: true,
  });
  if (result != tip[3]) {
    createConfigFile(result as string);
    return;
  }
  console.log("好的，即将退出");
  setTimeout(() => process.exit(), 800);
  return;
}
/** 测试文件是否存在  */
async function testFileExist(extension: string = "json") {
  const fileName = `miconfig.${extension}`,
    fileInfo = fileExist(fileName);
  const fileIsExist = fileInfo && fileInfo?.isFile();
  console.log(fileExist);

  // 判断是否存在，不存在则直接创建
  if (!fileIsExist) createConfigFile(extension);
  else {
    ///存在则询问是否覆盖
    const temporaryArr = ["覆盖", "跳过创建"];
    const result = await question({
      text: "文件已经存在，是否覆盖",
      tip: temporaryArr,
      resultText: "这一行不该有呀",
      private: true,
    });
    if (result == temporaryArr[0]) createConfigFile(extension);
    else {
      console.log("好的，即将为您退出");
      return setTimeout(() => process.exit(), 800);
    }
  }
}

/** 根据后缀调用相关的创建配置文件  */
function createConfigFile(extension: string = "json") {
  switch (extension) {
    case "ts":
      return createTsConfigFile();
    case "js":
      return createJsConfigFile();
    default:
      return createJsonConfigFile();
  }
}

/** 新增配置文件  */
function createJsonConfigFile() {
  const data = `{
  "hot": {
    "base": "..",
    "watch": ["${initData.cwd}"],
    "skip": ["exportMjs", "exportCjs", "exportTypes" ,"out"],
    "cwd": ".",
    "code": "node  ./index.js",
    "args": ["-v"],
    "beforeRestart": {
      "${initData.cwd}": "npm  run build"
    }
  }
}`;
  writeFileSync("miconfig.json", data, { encoding: "utf-8", flag: "w" });
}

function createTsConfigFile() {
  const data = `/**  请勿在函数体外添加非注释内容  */
// 配置项 https://github.com/lmssee/ihot/blob/main/%E8%87%AA%E8%BF%B0%E6%96%87%E4%BB%B6.md#配置说明
()=> ({
    //  热启动相关配置
    "hot": {
        // 监听文件的相对路径（这里不影响 \`cwd\` 路径， cwd 依旧相对于配置文件目录 ）
        "base": "../",
        // 监听的文件/夹，但他们内部文件变化，可触发再次启动
        "watch": ["${initData.cwd}"],
        // 打包编译文件，不监听以下文件内文件变化
        "skip": ["exportMjs", "exportCjs", "exportTypes"],
        // 启动 \`code\` 的相对目录，可以为空
        // "cwd": ".",
        // 执行的具体的命令
        "code": "node  ./index.js",
        // 启动时赋予 \`code\` 的参数
        "args": ["-v"],
        // 监听变化后，相对目录在再次启动前执行的命令
        // 这个属性应与 \`watch\` 元素相同
        "beforeRestart": {
            "${initData.cwd}": "npm  run build"
        }
    }
})`;
  writeFileSync("miconfig.ts", data, { encoding: "utf-8", flag: "w" });
}
function createJsConfigFile() {
  const data = `/**  请勿在函数体外添加非注释内容  */
// 配置项 https://github.com/lmssee/ihot/blob/main/%E8%87%AA%E8%BF%B0%E6%96%87%E4%BB%B6.md#配置说明
()=> ({
    //  热启动相关配置
    "hot": {
        // 监听文件的相对路径（这里不影响 \`cwd\` 路径， cwd 依旧相对于配置文件目录 ）
        "base": "../",
        // 监听的文件/夹，但他们内部文件变化，可触发再次启动
        "watch": ["${initData.cwd}"],
        // 打包编译文件，不监听以下文件内文件变化
        "skip": ["exportCjs", "exportMjs", "exportTypes"],
        // 启动 \`code\` 的相对目录，可以为空
        // "cwd": ".",
        // 执行的具体的命令
        "code": "node  ./index.js",
        // 启动时赋予 \`code\` 的参数
        "args": ["-v"],
        // 监听变化后，相对目录在再次启动前执行的命令
        // 这个属性应与 \`watch\` 元素相同
        "beforeRestart": {
            "${initData.cwd}": "npm  run build"
        }
    }
})`;
  writeFileSync("miconfig.js", data, { encoding: "utf-8", flag: "w" });
}
