const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');
const readline = require('readline');

const playback = require('./components/playback');
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
 * @param {Boolean} isPlayerActive
*/
function startMotionDetector(isPlayerActive) {
  logger.info(`Starting motion detector. Is player is active: ${isPlayerActive}`);
  motionDetector.init();
  motionDetector.onActiveAccelerometersChange((numberOfActiveAccelerometers) => {
    const state = convertToState(numberOfActiveAccelerometers);
    logger.info('Number of active accelerometers changed to:', numberOfActiveAccelerometers, 'State:', state);
    if (isPlayerActive) {
      playback.updateState(state);
    }
  });
}

/**
 * @param {Boolean} debugMode
*/
function startPlayer(debugMode) {
  logger.info(`Starting player.`);
  if (debugMode) {
    logger.info('Player debuger is active. Waiting for stdin input');
    listenForStdit();
  }
  playback.init();
}

/** */
function listenForStdit() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    if (line.startsWith('setState:')) {
      const state = line.split('setState:')[1].trim();
      logger.info('State received from stdin:', state);
      playback.updateState(state);
    }
  });
}

/**
 * @param {{activeComponents, debugPlayback}} configuration
 */
function init({ activeComponents, debugPlayback }) {
  logger.info('Initializing..');
  if (activeComponents.MOTION_DETECTOR) {
    startMotionDetector(activeComponents.PLAYBACK);
  }

  if (activeComponents.PLAYBACK) {
    startPlayer(debugPlayback);
  }
}

module.exports = {
  init,
};
