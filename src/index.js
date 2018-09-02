const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');

// const playback = require('./components/playback');
const motionDetector = require('./components/motion-detector');

/**
 */
function init() {
  logger.info('Initializing..');
  motionDetector.onActiveAccelerometersChange((numberOfActiveAccelerometers) => {
    logger.info('Number of active accelerometers changed to:', numberOfActiveAccelerometers);
  });
  // motionDetector.listenAccelerometerUpdates((data) => {
  //   logger.debug('Motion data:', data);
  // });
  // motionDetector.listenAccelerometerUpdates((value) => {
  //   logger.debug('Accelerometer updated to:', value);
  //   playback.updateState(value);
  // });
}

module.exports = {
  init,
};
