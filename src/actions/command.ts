// 创建实体对象

import { Command } from "ismi-command";

const command = new Command("ihot");

command
  .bind([
    {
      name: "init",
      abbr: "i",
      info: "初始化一个配置文件（该命令与其他命令冲突）",
      options: [
        "json   (初始化一个 JSON 格式的配置文件)",
        "ts <-t> (初始化一个 ts 格式的配置文件)",
        "js <-j> (初始化一个 js 格式的配置文件)",
      ],
    },
    "base (watch 的相对路径)",
    "watch (监听的文件/夹)",
    "cwd (执行代码的目录)",
    "code (要执行的代码)",
    "skip (要跳过的文件)",
    "args (执行参数)",
  ])
  .run();
// 倘若未执行完毕则直接退出
command.isEnd.end;

export default command;
