const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');

// const playback = require('./components/playback');
const motionDetector = require('./components/motion-detector');

/**
 * @param {Number} numberOfActiveAccelerometers
 * @return {String} state
 */
function convertToState(numberOfActiveAccelerometers) {
  let state;
  switch (numberOfActiveAccelerometers) {
  case 1:
    state = 'STATE_1';
    break;
  case 2:
    state = 'STATE_2';
    break;
  case 3:
    state = 'STATE_3';
    break;
  case 4:
    state = 'STATE_4';
    break;
  case 5:
    state = 'STATE_5';
    break;
  default:
    state = 'DEFAULT';
    break;
  }
  return state;
}

/**
 */
function init() {
  logger.info('Initializing..');
  motionDetector.onActiveAccelerometersChange((numberOfActiveAccelerometers) => {
    logger.info('Number of active accelerometers changed to:', numberOfActiveAccelerometers);
    const state = convertToState(numberOfActiveAccelerometers);
    //playback.updateState(state);
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
