const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('motion-detector/index');
const raspberryController = require('./controllers/raspberry');

let listener = function() {};

/**
 * @param  {Function} cb
 */
function listenAccelerometerUpdates(cb) {
  logger.debug('Setting state update listener', cb);
  listener = cb;
}

raspberryController.listenAccelerometers(listener);


module.exports = {
  listenAccelerometerUpdates,
};
