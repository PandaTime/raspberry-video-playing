/**
 * @return {Object} - Map of Winston's configuration options
 */
function getOptions() {
  const logLevel = process.env.LOG_LEVEL || 'debug' ||'info';
  const options = {
    // file: {
    //   level: logLevel,
    //   filename: `${appRoot}/logs/app.log`,
    //   handleExceptions: true,
    //   json: true,
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5,
    //   colorize: false,
    // },
    console: {
      level: logLevel,
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };
  return options;
}

module.exports = getOptions;
