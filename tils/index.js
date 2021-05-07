const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const chmod = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.accessSync(filePath);
    } catch {
      fs.chmodSync(filePath, 0o777);
    }
  }
};
const readFile = (filePath, flag = "r") => {
  chmod(filePath);
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(`${filePath} 文件不存在`);
    }
    fs.readFile(
      filePath,
      {
        flag,
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
  });
};
const writeFile = (filePath, data = "", flag = "w") => {
  // 写入的时候要判读下是否有权限进行写入
  chmod(filePath);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, { flag }, (err) => {
      if (err) return reject(err);
      resolve("success");
    });
  });
};
const readTemplate = () => {
  let tpath = path.join(__dirname, "..", "template.json");
  return readFile(tpath);
};
const textUp = (str = "") => {
  if (!str) return str;
  str = str.split("-");
  let res = [];
  for (let v of str) {
    let [first, ...rest] = v;
    res.push(first.toUpperCase() + rest.join(""));
  }
  return res.join("");
};
const pathNor = (rpath) => {
  return rpath.startsWith("/") ? rpath : "/" + rpath;
};
// 文件的数据的序列化
const sourceNormal = (data, filter) => {
  let source = JSON.parse(data).pages || JSON.parse(data);
  let value = Object.values(source);
  try {
    dfc(value);
  } catch (error) {
    throw new Error(error);
  }
  return value;
  function dfc(source, linkv = "") {
    for (let v of source) {
      if (linkv) {
        v.link = linkv + pathNor(v.router);
      } else {
        v.link = v.router;
      }
      filter && filter(v);
      if (v.subMenu && Array.isArray(v.subMenu) && v.subMenu.length) {
        dfc(v.subMenu, v.link);
      }
    }
  }
};
const handleCom = (data, template, prefix = "") => {
  let i = -1;
  // 生成页面位置
  while (++i < data.length) {
    let { pageName, subMenu = [], dirMode = false } = data[i];
    if (dirMode || (!dirMode && !subMenu.length)) {
      //  单个路由
      template.str += `
      const ${textUp(pageName)} = Loadable(() => import("src/pages/${prefix ? prefix + "/" : ""}${pageName}"), {
            fallback: <Loading />,
          });\n
        `;
    } else if (!dirMode && subMenu.length) {
      //  多个路由 都写入router配置里
      handleCom(subMenu, template, pageName);
    }
  }
};
const handleRouter = (data, template) => {
  //生成路由的方式
  for (let { pageName, dirMode = false, subMenu = [], link, router } of data) {
    if (dirMode || (!dirMode && !subMenu.length)) {
      template.r += `{
        exact: true,
        path: "${link ?? router}",
        component: ${textUp(pageName)},
      },`;
    } else if (!dirMode && subMenu.length) {
      handleRouter(subMenu, template);
    }
  }
};
const mkdir = async (data, targetPath) => {
  try {
    //递归写入目录
    for (let { pageName, subMenu = [], dirMode = false } of data) {
      mkdirp.sync(`${targetPath}/${pageName}`);
      if (!subMenu.length) {
        let r = await readFile(path.join(__dirname, "..", "tempateFile/index.tsx"));
        await writeFile(`${targetPath}/${pageName}/index.tsx`, r);
      } else {
        if (dirMode) {
          let f = ``;
          let router = "";
          for (let { pageName: fileName, router: ro } of subMenu) {
            f += `const ${textUp(fileName)} = lazy(() => import("./${fileName}"));`;
            router += `<Route path="${pathNor(ro)}" render={(p) => <${textUp(fileName)} {...p} />} />`;
          }
          // 额外生成一个index.tsx文件
          const Tem = `//@ts-nocheck
          import React, { lazy } from "react";
          import { Route, Switch } from "react-router-dom";
          import Suspense from "src/common/suspense";
          ${f}
          
          export default function (props: any) {
            return (
              <Suspense>
                <Switch>
                 ${router}
                </Switch>
              </Suspense>
            );
          }
          `;
        //   let r = await readFile(path.join(__dirname, "..", "tempateFile/mindex.tsx"));
          await writeFile(`${targetPath}/${pageName}/index.tsx`, Tem);
          // 遍历subMenu
          mkdir(subMenu, `${targetPath}/${pageName}`);
        } else {
          // 生成subMenu的文件
          for (let { pageName: fileName } of subMenu) {
            let r = await readFile(path.join(__dirname, "..", "tempateFile/index.tsx"));
            await writeFile(`${targetPath}/${pageName}/${fileName}.tsx`, r);
          }
        }
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
const router = (data, path = "/") => {
  const menu = sourceNormal(data);
  let template = {
    str: `
        import Loadable from "@loadable/component";
        import React from "react";
        import { Loading } from "src/ui";
      `,
    r: "",
  };
  try {
    handleCom(menu, template);
    mkdir(menu, path);
    handleRouter(menu, template);
  } catch (error) {
    throw new Error(error);
  }
  template = template.str + "\n export default [" + template.r + "]";
  return template;
};
exports.readTemplate = readTemplate;
exports.readFile = readFile;
exports.chmod = chmod;
exports.writeFile = writeFile;
exports.sourceNormal = sourceNormal;
exports.router = router;
