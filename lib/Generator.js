const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const ejs = require('ejs');
const spawn = require('cross-spawn');
const spawnSync = spawn.sync;

class Generator {
  templates = ['React', 'Vue'];
  constructor(name, options) {
    this.name = name;
    this.options = options;
    this.targetDir = path.join(process.cwd(), name);
  }
  async dir() {
    const { targetDir, options } = this;
    if (fs.existsSync(targetDir)) {
      if (options.force) {
        await fs.remove(targetDir);
      } else {
        let { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message:
              'Target directory already exists. Do you want to overwrite it?',
            choices: [
              {
                name: 'Yes',
                value: true
              },
              {
                name: 'No',
                value: false
              }
            ]
          }
        ]);
        if (action) {
          const spinner = ora('Removing...');
          spinner.start();
          await fs.remove(targetDir);
          spinner.succeed('Removed');
        }
      }
    } else {
      spawnSync('mkdir', [this.name], {
        stdio: 'inherit',
        // shell: true
      });
    }
  }
  async create() {
    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Please choose a template to create project:',
        choices: this.templates,
        default: 'React'
      }
    ]);
    // 搭建 electron 框架
    spawnSync('npm', ['init', '-y'], {
      cwd: this.targetDir,
      stdio: 'inherit',
    });
    spawnSync('npm', ['install', '--save-dev', 'electron', '@electron-forge/cli'], {
      cwd: this.targetDir,
      stdio: 'inherit',
    });
    spawnSync('npx ', ['electron-forge', 'import'], {
      cwd: this.targetDir,
      stdio: 'inherit',
    });
    // 修改 package.json 命令
    const packageJson = path.join(this.targetDir, 'package.json');
    const packageObj = fs.readJSONSync(packageJson);
    packageObj.scripts.start = `cd core && npm run build && cd ../ && ${packageObj.scripts.start}`;
    // packageObj.scripts.start = `electron-forge start`;
    fs.outputJsonSync(packageJson, packageObj, {
      spaces: 2
    });
    // 复制模板文件
    const tplUrl = path.join(__dirname, '../templates');
    fs.readdir(tplUrl, (err, files) => {
      if (err) throw err;
      files.forEach(async (file) => {
        const oldFile = path.join(tplUrl, file);
        const newFile = path.join(this.targetDir, file);
        fs.copySync(oldFile, newFile);
        if(/\.js$/.test(file)) {
          await ejs
          .renderFile(oldFile, { path: 'core/build' })
          .then((data) => {
            fs.writeFileSync(newFile, data);
          });
        }
      });
    });
    // 创建模板项目
    switch (template) {
      case 'Vue': {
        break;
      }
      case 'React':
      default: {
        spawnSync('npm', ['init', 'react-app', "core"], {
          cwd: this.targetDir,
          stdio: 'inherit',
        });
      }
    }
  }
}

module.exports = Generator;
