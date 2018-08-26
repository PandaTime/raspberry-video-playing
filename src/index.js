const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');

const playback = require('./components/playback');
const motionDetector = require('./components/motion-detector');

/**
 */
function init() {
  logger.info('Initializing..');
  motionDetector.listernAccelerometerUpdates((value) => {
    logger.debug('Accelerometer updated to:', value);
    playback.updateState(value);
  });
}

module.exports = {
  init,
};
