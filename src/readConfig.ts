import { fileExist, readFileToJsonSync, Color } from 'ismi-node-tools';
import { readFileSync } from 'node:fs';
import hotData from './hotData';
import { typeOf } from 'ismi-js-tools';
import { log } from 'node:console';

/** Read configuration file
 *
 *
 *  读取配置文件
 *   */
export async function readConfig() {
  /** 查找文件的类型 */
  const config = ['ts', 'js', 'json'].find((currentEle: string) => {
    /** 设定临时值 */
    const _temporary = fileExist(`miconfig.${currentEle}`);
    return _temporary && _temporary.isFile();
  });
  // 如果没有配置文件文件
  if (!config) return {};
  hotData.configFileName = 'miconfig.'.concat(config);
  switch (config) {
    case 'ts':
      return await readTsFile();
    case 'js':
      return getTextOfJsFile(
        readFileSync('miconfig.'.concat(config)).toString(),
      );
    // eval(a.toString());
    case 'json':
      return readFileToJsonSync(hotData.configFileName).hot;
    default:
      break;
  }
}

/** 读取 ts 配置文件 */
async function readTsFile() {
  try {
    const ts = (await import('typescript')).default;
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
    console.log(error);
    console.log(
      Color.yellow(`  从 'miconfig.ts' 文件读取配置失败`).concat(
        ' \n 请确保您已安装 typescript \n',
      ),
    );
  }
  return {};
}

/** 通过 js 文件获配置 */
function getTextOfJsFile(str: string) {
  let _str = str
    .toString()
    .replace(/(\/\/.*?\r?\n)/gm, '')
    .replace(/(\/\*+(.*\r?\n)*?.*?\*\/)/gm, '')
    .replace(/\n(\s*\r?\n)+/gm, '\n')
    .replace(/\r?\n/gm, '')
    .replace(/\s{2,}/gm, ' ');
  const getFun = new Function('return' + _str)();
  return (typeOf(getFun) == 'function' && getFun().hot) || {};
}
