# @lmssee/hot

A simple hot start (abbreviated as `lmhot`). Simple, it's because only do one thing, listen for file changes, and restart the execution command

<table><tr>
<td><a href="https://github.com/lmssee/lmhot/blob/main/ReadMe.md"  target="_self">English</a></td>
<td><a href="https://github.com/lmssee/lmhot/blob/main/自述文件.md"  target="_self">中文</a></td>
</tr></table>

## install

```sh
npm  install --save-dev  @lmssee/simple-hot
```

## Using configuration files

~~Can configure files such as' lmssee.config.json ',' lmssee.config. ts', and 'lmssee.config.js' to configure hot values for heating updates~~
~~If both configurations exist, the final configuration will be '.json'. If there is no '.json' file, the final configuration will be '.js' file~~
Currently, only configuration files in the '.json' format are supported

```json
{
  "hot": {
    /**  Hot start-up listening files */
    "watch": "./forge",
    /**
     * Default not listening to   *\/lib, *\/cjs, and *\/es
     * packaged content,can be changed according to actual situation
     */
    "skip": ["lib", "es", "cjs"], //
    /**  Command used  */
    "code": "ls", //
    /**
     *  The parameters passed in can be directly placed into
     *  the code attribute.
     *  After executing the command, pay attention to the order
     */
    "args": ["-al"], //
    /**
     *Other commands that need to be executed before executing
     *  the command can be directly placed in the code attribute.
     *  Before executing the command, pay attention to the order
     */
    "beforReStart": "clear" //
  }
}
```

~~If during startup, except for `npx lmhot` (non global installation) and `lmhot` (global installation), which have parameters after startup, the configuration file will be directly overwritten~~

At present, startup parameters are not supported, only the `.json` configuration file is supported

## Configuration Description

### `watch` ： listening object

`watch` is the file or folder to listen to, defaulting to `.`, The current hot restart path. Can be changed by oneself

```json
  watch : "forge"
```

If you want to listen to multiple folders, you can use arrays to modify the default values

```json
  watch: ['forge', 'tools']
```

### `skip` : Ignored files

`skip` Configure files that ignore listening **If the build file is not included, it may cause an infinite loop: clean ->build ->clean ->build**

If you have any questions, you can [send a email](mailto:lmssee@icloud.com?subject=hello&cc=lmssee@qq.com,letmiseesee@gmail.com&bcc=lmssee@outlook.com&Body=Hello:) or [push twitter](https://twitter.com/letmiseesee) or [telephone contact](tel:+8613011040420) or directly [submit question](https://github.com/lmssee/os/issues/new)
