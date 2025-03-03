// 这个文件会帮我们 packages下的模块打包，最终打包出来的JS文件

// node dev.js （要打包的名字 -f 打包的格式）
import minimist from "minimist";
import { resolve, dirname } from 'path'
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild"

// node中的命令行参数通过process.argv获取
const args = minimist(process.argv.slice(2));


// esm  使用commonjs 的变量 也就是用nodejs的模块
const __filename = fileURLToPath(import.meta.url); // 获取当前文件的绝对路径 去掉file://
const __dirname = dirname(__filename) // node中esm模块没有__dirname
// require 写法是 commonjs 规范; import 写法是 esm 规范; 默认支持import esm模块化，但是不支持cjs模块化 做兼容处理，支持两种写法
const require = createRequire(import.meta.url); // 获取当前文件的require方法
const target = args._[0] || "reactivity"; // 打包哪个项目
const format = args.f || "iife"; // 打包后的模块化规范

// console.log(require); // file:///Users/momo/gitee/vue3-lesson/scripts/dev.js
// console.log(import.meta.url); // file:///Users/momo/gitee/vue3-lesson/scripts/dev.js
// console.log(__filename); // 文件路径  /Users/momo/gitee/vue3-lesson/scripts/dev.js
// console.log(__dirname); // 目录路径 /Users/momo/gitee/vue3-lesson/scripts

// node 中esm模块没有 　__dirname 

// 打包入口文件 根据通过的命令行参数确定打包哪个项目的入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`); // 入口文件
const pkg = require(`../packages/${target}/package.json`); // 项目的package.json文件

// 根据需要进行打包

esbuild.context({
  entryPoints: [entry], // 入口文件
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 打包后的文件名
  format: format, // 打包后的模块化规范 cjs iife esm
  bundle: true, // 打包成一个文件 reactivity -> shared
  platform: "browser", // 打包后给浏览器使用
  sourcemap: true, // 生成sourcemap文件  可以调试源代码
  globalName: pkg.buildOptions?.name, // iife 自执行函数 需要有个名字来接受 全局变量名
}).then((ctx) => {
  console.log(`✅ ${target} 项目打包成功`);
  return ctx.watch(); // 监控入口文件持续打包
})