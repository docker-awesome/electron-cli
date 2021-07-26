const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const ejs = require('ejs');
const { spawnSync } = require('child_process');

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
    switch (template) {
      case 'Vue': {
        break;
      }
      case 'React':
      default: {
        const tplUrl = path.join(__dirname, '../templates');
        spawnSync('mkdir', [this.name], { stdio: 'inherit' });
        spawnSync('npm', ['init', '-y'], {
          cwd: this.targetDir,
          stdio: 'inherit'
        });
        spawnSync('npm', ['install', '--save-dev', 'electron'], {
          cwd: this.targetDir,
          stdio: 'inherit'
        });
        fs.readdir(tplUrl, (err, files) => {
          if (err) throw err;
          files.forEach(async (file) => {
            await ejs
              .renderFile(path.join(tplUrl, file), { path: 'react-demo/build' })
              .then((data) => {
                fs.writeFileSync(path.join(this.targetDir, file), data);
              });
          });
        });
        spawnSync('npx', ['create-react-app', 'core'], {
          cwd: this.targetDir,
          stdio: 'inherit'
        });
      }
    }
  }
}

module.exports = Generator;
