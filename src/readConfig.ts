import {
  fileExist,
  readFileToJsonSync,
  runOtherCode,
} from "@lmssee/node-tools";
import { mkdirSync, readFileSync } from "node:fs";
import hotData from "./hotData";
import { typeOf } from "@lmssee/tools";
import { Color, t } from "lmcmd";

/** Read configuration file
 *
 *
 *  读取配置文件
 *   */
export async function readConfig() {
  /** 设定临时值 */
  let _temporary;
  /** 查找文件的类型 */
  const config = ["ts", "js", "json"].find(
    (currentEle: string) =>
      (_temporary = fileExist(`lmconfig.${currentEle}`)) &&
      _temporary &&
      _temporary.isFile()
  );
  // 如果没有配置文件文件
  if (!config) return {};
  hotData.configFileName = "lmconfig.".concat(config);
  switch (config) {
    case "ts":
      return await readTsFile();
    case "js":
      return getTextOfJsFile(
        readFileSync("lmconfig.".concat(config)).toString()
      );
    // eval(a.toString());
    case "json":
      return readFileToJsonSync(hotData.configFileName).hot;
    default:
      break;
  }
}

async function readTsFile() {
  try {
    const ts = (await import("typescript")).default;
    const sourceCode = readFileSync(hotData.configFileName).toString();

    const transpiledCode = ts.transpileModule(sourceCode, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.CommonJS,
      },
    });
    const resultText = transpiledCode.outputText;

    if (resultText.length > 0) return getTextOfJsFile(resultText);
  } catch (error) {
    console.log(
      Color.yellow(`  从 'lmconfig.ts' 文件读取配置失败`).concat(
        " \n 请确保您已安装 typescript \n"
      )
    );
  }
  return {};
}

function getTextOfJsFile(str: string) {
  const _str = str
    .toString()
    .replace(/(\/\/.*?\n)/gm, "")
    .replace(/(\/\*+(.*\n)*?.*?\*\/)/gm, "")
    .replace(/\n(\s*\n)+/gm, "\n")
    .replace(/\n/gm, "")
    .replace(/\s{2,}/gm, " ");
  const getFun = new Function("return" + _str)();
  return (typeOf(getFun) == "function" && getFun().hot) || {};
}
