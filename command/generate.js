const path = require("path");
const { readTemplate, writeFile, normalize } = require("../tils");

// 生成配置文件模版
const generate = (spin) =>  function generate(argv) {
    let { name } = normalize(argv);
    console.log("name", name);
    name = name ? name : "config";
    spin.start("正在生成配置文件");
    readTemplate()
        .then(data => {
            writeFile(path.resolve(process.cwd(), `${name}.json`), data, "wx+")
                .then(() => {
                    spin.succeed(`已生成${name}.json`);
                })
                .catch(() => {
                    spin.fail("生成失败,已有配置文件");
                });
        })
        .catch(err => {
            spin.fail("生成失败");
            console.log(err);
        });
}

exports.generate = generate