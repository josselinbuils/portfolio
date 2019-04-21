module.exports = class Logger {
  static error(str) {
    log('ERROR', str);
  }

  static info(str) {
    log('INFO', str);
  }
};

function log(level, str) {
  let date =
    '\x1b[0m[' +
    new Date().toDateString() +
    ' ' +
    new Date().toLocaleTimeString() +
    '] ';

  switch (level) {
    case 'ERROR':
      level = '\x1b[91m[' + level + ']';
      break;
    case 'INFO':
      level = '\x1b[32m[' + level + ']\x1b[0m';
      break;
    default:
      throw new Error('Unknown log level');
  }

  str = ' ' + str + '\x1b[0m';

  console.log(date + level + str);
}
