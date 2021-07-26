const Generator = require('./Generator');

module.exports = async function (name, options) {
  // 创建项目
  const generator = new Generator(name, options);

  // 目录是否存在
  await generator.dir();

  // 开始创建项目
  await generator.create();
};
