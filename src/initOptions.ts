import hotData from "./hotData";
import { readConfig } from "./readConfig";
import { Color } from "ismi-node-tools";

/** 获取自定义配置，这里对用户的自定义配置进行处理 */
async function initOptions() {
  /** 读取配置文件 */
  const op = await readConfig();

  hotData.options = Object.assign(
    {
      base: "",
      cwd: process.cwd(),
      watch: ["."],
      skip: /out|types/,
      remove: true,
      code: "",
      args: [],
      beforeRestart: {},
    },
    hotData.initArg
  );
  /** 获取配置文件 */
  if (!op || Object.keys(op).length == 0)
    return console.log(
      Color.darkBlue("您未配置配置文件，即将为您自动启动默认配置")
    );
  // 自定义配置处理
  op.watch = optionToArray(op.watch);
  op.skip = optionToArray(op.skip);
  op.skip = !op.skip
    ? null
    : new RegExp(
        op.skip.concat(hotData.configFileName).join("|").replace(/\./gm, "\\.")
      );
  /**
   *
   * 临时变量，处理执行的代码
   */
  const _temp = op.code
    ? op.code
        .trim()
        .replace(/\s{2,}/gm, " ")
        .split(" ")
    : [];
  let __temp: string | any[];
  [op.code, ...__temp] = _temp;

  op.args = op.args ? __temp.concat(op.args) : __temp;
  op.remove = !(op.remove == false);
  const options: any = hotData.options;
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key) && op[key]) {
      options[key] = op[key];
    }
  }
  // 整理数据
  hotData.manage();
  return true;
}

/** 处理配置单输入转化为数组  */
function optionToArray(o: any): null | string[] {
  return (
    (!o && null) ||
    (typeof o == "string" && [o]) ||
    (Array.isArray(o) && o) ||
    null
  );
}

export default initOptions;
