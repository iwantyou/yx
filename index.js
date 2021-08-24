const yargs = require("yargs")
const ora = require("ora");
const { init } = require("./command/init")
const { generate } = require("./command/generate")

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

// // 初始化克隆仓库
// function init(argv) {
//     let repoargv = normalize(argv);
//     spin.start("正在拉取仓库...");
//     gitClone({ url: repoargv.url, targetPath: repoargv.project }, async err => {
//         spin.stop(`拉取仓库${err ? "失败" : "成功"}`);
//         if (err) {
//             return spin.fail("拉取仓库失败, 请检查仓库是否存在");
//         }
//         spin.succeed("拉取仓库成功");
//         rimraf.sync(`${repoargv.project}/.git`);
//         spin.start("正在读取配置文件...");
//         try {
//             let data = await readFile(repoargv.config);
//             const source = `export default ${JSON.stringify(
//                 sourceNormal(data, v => {
//                     Reflect.deleteProperty(v, "pageName");
//                     Reflect.deleteProperty(v, "router");
//                     Reflect.deleteProperty(v, "dirMode");
//                     if (Reflect.has(v, "subMenu")) {
//                         Reflect.deleteProperty(v, "link");
//                     }
//                 }),
//                 null,
//                 4
//             )}`;
//             let configPath = path.join(repoargv.project, "src/config/menu.ts");
//             let routerPath = path.join(repoargv.project, "src/config/router.tsx");
//             // 配置menu菜单
//             let menu = writeFile(configPath, source, "w+");
//             // 配置router && 生成目录
//             let routers = writeFile(
//                 routerPath,
//                 router(data, path.join(repoargv.project, "src/pages")),
//                 "w+"
//             );
//             await Promise.all([menu, routers]);
//             spin.succeed("写入配置成功");
//         } catch (err) {
//             spin.fail("写入配置失败");
//             console.log(err);
//             rimraf.sync(repoargv.project);
//         }
//     });
// }
// // 生成配置文件模版
// function generate(argv) {
//     let { name } = normalize(argv);
//     console.log("name", name);
//     name = name ? name : "config";
//     spin.start("正在生成配置文件");
//     readTemplate()
//         .then(data => {
//             writeFile(path.resolve(process.cwd(), `${name}.json`), data, "wx+")
//                 .then(() => {
//                     spin.succeed(`已生成${name}.json`);
//                 })
//                 .catch(() => {
//                     spin.fail("生成失败,已有配置文件");
//                 });
//         })
//         .catch(err => {
//             spin.fail("生成失败");
//             console.log(err);
//         });
// }
