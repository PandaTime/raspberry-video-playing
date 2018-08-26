const winston = require('winston');

const getOptions = require('./../config/winston');

// instantiate a new Winston Logger with the settings defined above
/**
 * Function to create logger
 * @return {WinstonLogger} internal function
 */
function createLogger() {
  const options = getOptions();
  const transports = [];
  if (options.file) {
    transports.push(new winston.transports.File(options.file));
  }
  if (options.console) {
    transports.push(new winston.transports.Console(options.console));
  }
  const logger = new winston.Logger({
    transports,
    exitOnError: false, // do not exit on handled exceptions
  });
  return logger;
}

/**
 * @param  {String} name of the logged module
 * @return {Object} Map of logging functions(info|debug|warn|error)
 */
function initialize(name) {
  const logger = createLogger();
  const appendName = '[' + name + ']';
  return {
    info: logData.bind(this, logger.info, appendName),
    debug: logData.bind(this, logger.debug, appendName),
    warn: logData.bind(this, logger.warn, appendName),
    error: logData.bind(this, logger.error, appendName),
  };
}
/**
 * @param  {Winston<logMethod>} loggerMethod
 * @param  {String} appendName
 * @param  {Array<arg>} props
 */
function logData(loggerMethod, appendName, ...props) {
  const time = (new Date()).toISOString();
  loggerMethod(time, '-', appendName, ...props);
}

const LOGGER = initialize('logger.js');
if (getOptions().console) {
  LOGGER.info('[winston.js]', `Initialized console logger in: "${getOptions().console.level}" mode.`);
} else {
  LOGGER.error('[winston.js]', 'Console output wasnt initialized.');
}
if (getOptions().file) {
  LOGGER.info('[winston.js]', `Initialized file logger in: "${getOptions().file.level}" mode.`);
} else {
  LOGGER.error('[winston.js]', 'File output wasnt initialized.');
}


module.exports = initialize;
