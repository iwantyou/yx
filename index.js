#!/usr/bin/env node
const yargs = require("yargs");
const ora = require("ora");
const { init } = require("./command/init");
const { generate } = require("./command/generate");

let spin = ora();
yargs(process.argv.slice(2))
    .options({
        config: {
            alias: "c",
            describe: "快速构建的模版的配置项是一个json文件",
            default: "config.json",
        },
        project: {
            alias: "p",
            describe: "生成模版目标存放路径",
        },
        repo: {
            alias: "r",
            describe: "仓库的地址 支持ssh和https",
            default: "ssh://git@gitlab.asiainfo.com:10022/ai-ar/ai-ar-web.git",
        },
    })
    .command("init <name>", "在指定仓库上拉取代码并写入配置", {}, init(spin))
    .command("generate [name]", "生成配置模版config.json", {}, generate(spin))
    .help()
    .alias("h", "help")
    .version("1.0.0")
    .alias("v", "version").argv;