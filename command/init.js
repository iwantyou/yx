const gitClone = require("../git-clone");
const path = require("path");
const rimraf = require("rimraf");
const { readFile, writeFile, sourceNormal, router, normalize } = require("../tils");
// 初始化克隆仓库
 const init = (spin)  => function init(argv) {
    let repoargv = normalize(argv);
    spin.start("正在拉取仓库...");
    gitClone({ url: repoargv.url, targetPath: repoargv.project }, async err => {
        spin.stop(`拉取仓库${err ? "失败" : "成功"}`);
        if (err) {
            return spin.fail("拉取仓库失败, 请检查仓库是否存在");
        }
        spin.succeed("拉取仓库成功");
        rimraf.sync(`${repoargv.project}/.git`);
        spin.start("正在读取配置文件...");
        try {
            let data = await readFile(repoargv.config);
            const source = `export default ${JSON.stringify(
                sourceNormal(data, v => {
                    Reflect.deleteProperty(v, "pageName");
                    Reflect.deleteProperty(v, "router");
                    Reflect.deleteProperty(v, "dirMode");
                    if (Reflect.has(v, "subMenu")) {
                        Reflect.deleteProperty(v, "link");
                    }
                }),
                null,
                4
            )}`;
            let configPath = path.join(repoargv.project, "src/config/menu.ts");
            let routerPath = path.join(repoargv.project, "src/config/router.tsx");
            // 配置menu菜单
            let menu = writeFile(configPath, source, "w+");
            // 配置router && 生成目录
            let routers = writeFile(
                routerPath,
                router(data, path.join(repoargv.project, "src/pages")),
                "w+"
            );
            await Promise.all([menu, routers]);
            spin.succeed("写入配置成功");
        } catch (err) {
            spin.fail("写入配置失败");
            console.log(err);
            rimraf.sync(repoargv.project);
        }
    });
}

exports.init = init