#! /usr/bin/env node
const program = require('commander');

program
  .command('create <app-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/main.js')(name, options);
  });

program
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]');

program.parse(process.argv);
