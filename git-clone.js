const { spawn } = require("child_process");

function gitClone(argv = {}, callback) {
  const { checkout, url, targetPath, depth } = argv;
  let gitarg = ["clone"];
  depth && gitarg.push.apply(["--depth", depth]);
  gitarg.push(url);
  targetPath && gitarg.push(targetPath);
  const pro = spawn("git", gitarg);
  pro.on("close", (code) => {
    if (code === 0) {
      if (checkout) {
        _checkout();
      } else {
        callback && callback();
      }
    } else {
      callback && callback(new Error(`拉取库过程中出现错误，状态码为${code}`));
    }
  });
  function _checkout() {
    const pro = spawn("git", ["checkout", checkout], { cwd: targetPath });
    pro.on("close", (code) => {
      if (code === 0) {
        // success
        callback && callback();
      } else {
        // 异常
        callback && callback(new Error(`拉取库过程中出现错误，状态码为${code}`));
      }
    });
  }
}

module.exports = gitClone;
