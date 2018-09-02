const appRoot = require('app-root-path');
const { LOG_LEVEL } = require('./configuration.json');
/**
 * @return {Object} - Map of Winston's configuration options
 */
function getOptions() {
  const options = {
    file: {
      level: LOG_LEVEL.FILE,
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: LOG_LEVEL.CONSOLE,
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };
  return options;
}

module.exports = getOptions;
