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

raspberryController.listenAccelerometers()
  .watch((err, value) => {
    if (err) {
      logger.error('Something went wrong with accelerometer response', err);
      throw err;
    }
    listener(value);
  });


module.exports = {
  listenAccelerometerUpdates,
};
