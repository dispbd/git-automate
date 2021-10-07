const cmd = require('node-cmd'); //Windows multiline commands are not guaranteed to work try condensing to a single line.

let paths = [
  'D:/Work/Projects/crm',
  'D:/Work/Projects/vp.tracker',
];


exports.install = function() {
  SCHEDULE('00:00', '15 minute', () => {
    paths.forEach(path => {
      let status = cmd.runSync(`cd ${ path } & git status --porcelain`);
      if (status.data != "") {
        let m = {
          add: [],
          upd: [],
          rem: [],
        };

        status.data.split(/\r?\n/).forEach((comm, i) => {
          comm.includes("?? ") ? m.add.push(U.getName(comm.replace("?? ", ''))) : '';
          comm.includes(" M ") ? m.upd.push(U.getName(comm.replace(" M ", ''))) : '';
          comm.includes(" D ") ? m.rem.push(U.getName(comm.replace(" D ", ''))) : '';
        });

        let comms = [
          m.add.length > 0 ? 'ADD ' + m.add.unique().join(', ') : '',
          m.upd.length > 0 ? 'UPD ' + m.upd.unique().join(', ') : '',
          m.rem.length > 0 ? 'REM ' + m.rem.unique().join(', ') : '',
        ];

        let commands = [
          'git add .', // - добавить все файлы для коммита 
          `git commit -m "${ comms.filter(comm => comm.length > 0).join(' | ') }"`, // - зафиксировать
          'git push' //- залить на гит,
        ];

        let run = cmd.runSync(`cd ${ path } & ${ commands.join(' & ') }`)
        console.log(commands[1], run.data);
      }
    });
  });

}