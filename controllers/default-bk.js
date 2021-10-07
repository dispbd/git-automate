const watch = require('watch');
const cmd = require('node-cmd'); //Windows multiline commands are not guaranteed to work try condensing to a single line.

const excl_files = [
  'package-lock.json',
  'debug.js.json',
  'debug.pid',
  'release.js.json',
  'release.pid',
  '_fakeData-bk.js',
];
const excl_paths = [
  '.git',
  '.vscode',
  'tmp',
  'node_modules',
  'databases',
  'logs',
  '_front-crm',
  'acme-challenge',
];

let paths = [
  'D:/Work/Projects/crm.excellentstyle.pro',
];

let commits = {};
exports.install = function() {
  SCHEDULE('00:00', '10 minute', () => {
    paths.forEach(path => {
      let m = commits[path];
      if (m.add.length + m.upd.length + m.rem.length > 0) {
        let comms = [
          m.add.length > 0 ? '_add ' + m.add.unique().join(', ') : '',
          m.upd.length > 0 ? '_upd ' + m.upd.unique().join(', ') : '',
          m.rem.length > 0 ? '_rem ' + m.rem.unique().join(', ') : '',
        ];

        let commands = [
          'git add .', // - добавить все файлы для коммита 
          `git commit -m "${ comms.filter(comm => comm.length > 0).join(' | ') }"`, // - зафиксировать
          'git push' //- залить на гит,
        ];

        let run = cmd.runSync(`cd ${ path } & ${ commands.join(' & ') }`);
        console.log(run.data);

        commits[path].add = [];
        commits[path].upd = [];
        commits[path].rem = [];
      }
    });
  });

  paths.forEach(path => {
    commits[path] = {
      add: [],
      upd: [],
      rem: [],
    };

    watch.createMonitor(path, {
        filter: file => {
          let flag = true;

          excl_files.includes(file.split('\\').last()) ? flag = false : '';
          excl_paths.forEach(excl_path => file.includes(excl_path) ? flag = false : '');

          return flag;
        }
      },
      monitor => {
        monitor.on("created", function(file, stat) {
          commits[path].add.push(file.split('\\').last());
        })
        monitor.on("changed", function(file, curr, prev) {
          commits[path].upd.push(file.split('\\').last());
        })
        monitor.on("removed", function(file, stat) {
          commits[path].rem.push(file.split('\\').last());
        });
      });
  });
}