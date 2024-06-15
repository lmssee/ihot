# ihot

A simple hot start (abbreviated as `ihot`). Simple, it's because only do one thing, listen for file changes, and restart the execution command

<table><tr>
<td><a href="https://github.com/lmssee/ihot/blob/main/README.md"  target="_self">English</a></td>
<td><a href="https://github.com/lmssee/ihot/blob/main/自述文件.md"  target="_self">中文</a></td>
</tr></table>

## use

```sh
npx  ihot
```

## Using configuration files

Can configure files such as' miconfig.json ',' miconfig.ts', and 'miconfig.js' to configure hot values for heating updates

If both configurations exist, the final configuration will be '.json'. If there is no '.json' file, the final configuration will be '.js' file

### create profile

Create a configuration file using the `init` command

```sh

npx ihot init # Independently selecting configuration files
npx ihot init JSON # Use JSON to configure format files
npx ihot i -n # Use JSON to configure format files
npx ihot init js # Use js to configure format files
npx ihot i -j # Use JavaScript to configure format files
npx ihot init ts # Use ts to configure format files
npx ihot i -t # Use ts configuration format file
```

_You can use - h to view specific usage and their abbreviations_

### JSON format configuration file

```ts
{
  "hot": {
    /***  base */
    "base": "..",
    /**  cwd   */
    // "cwd": "",
    /**  Hot start-up listening files */
    "watch": "ihot",
    /**
     * Default not listening to   *\/lib, *\/cjs, and *\/es
     * packaged content,can be changed according to actual situation
     */
    "skip": ["exportCjs", "exportMjs", "exportTypes"],
    /**  Command used  */
    "code": "npx lmssee",
    /**
     *  The parameters passed in can be directly placed into
     *  the code attribute.
     *  After executing the command, pay attention to the order
     */
    "args": ["-al"],
    /** Other commands that need to be executed before executing  */
    "beforeReStart": {
      "ihot": "npm  run build "
    }
  }
}
```

### JS format configuration file

```ts
/**  Do not add non commented content outside the function body  */
// see in  https://github.com/lmssee/ihot/blob/main/%E8%87%AA%E8%BF%B0%E6%96%87%E4%BB%B6.md#配置说明
() => ({
  //  热启动相关配置
  hot: {
    // 监听文件的相对路径（这里不影响 \`cwd\` 路径， cwd 依旧相对于配置文件目录 ）
    base: '..',
    // 监听的文件/夹，但他们内部文件变化，可触发再次启动
    watch: ['ihot'],
    // 打包编译文件，不监听以下文件内文件变化
    skip: ['exportCjs', 'exportMjs', 'exportTypes'],
    // 启动 \`code\` 的相对目录，可以为空
    // "cwd": ".",
    // 执行的具体的命令
    code: 'node  ./index.js',
    // 启动时赋予 \`code\` 的参数
    args: ['-v'],
    // 监听变化后，相对目录在再次启动前执行的命令
    // 这个属性应与 \`watch\` 元素相同
    beforeRestart: {
      ihot: 'npm  run build',
    },
  },
});
```

### TS format configuration file

```ts
/**  Do not add non commented content outside the function body  */
// 配置项 https://github.com/lmssee/ihot/blob/main/%E8%87%AA%E8%BF%B0%E6%96%87%E4%BB%B6.md#配置说明
() => ({
  //  热启动相关配置
  hot: {
    // 监听文件的相对路径（这里不影响 \`cwd\` 路径， cwd 依旧相对于配置文件目录 ）
    // "base": ".",
    // 监听的文件/夹，但他们内部文件变化，可触发再次启动
    watch: ['.', 'src'],
    // 打包编译文件，不监听以下文件内文件变化
    skip: ['out', 'types'],
    // 启动 \`code\` 的相对目录，可以为空
    // "cwd": ".",
    // 执行的具体的命令
    code: 'node  ./index.js',
    // 启动时赋予 \`code\` 的参数
    args: ['-v'],
    // 监听变化后，相对目录在再次启动前执行的命令
    // 这个属性应与 \`watch\` 元素相同
    beforeRestart: {
      src: 'npm  run build',
    },
  },
});
```

If during startup, except for `npx ihot` (non global installation) and `ihot` (global installation), which have parameters after startup, the configuration file will be directly overwritten

## Configuration Description

### `watch` ： listening object

`watch` is the file or folder to listen to, defaulting to `.`, The current hot restart path. Can be changed by oneself

```json
  watch : "cli"
```

If you want to listen to multiple folders, you can use arrays to modify the default values

```json
  watch: ["cli", "tools"]
```

### `skip` : Ignored files

`skip` Configure files that ignore listening **If the build file is not included, it may cause an infinite loop: clean ->build ->clean ->build**

If you have any questions, you can directly [submit question](https://github.com/lmssee/ihot/issues/new)
