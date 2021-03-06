const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');
const readline = require('readline');

const { STATES, DEFAULT_STATE, RANDOM_STATE } = require(`${appRoot}/config/configuration.json`);

const playback = require('./components/playback');
const motionDetector = require('./components/motion-detector');
const accelerometersToState = getAccelerometersToStateMatch();
/**
 * @return {Object} - with key to state matcher, e.g. { 0: "DEFAULT_STATE"  }
*/
function getAccelerometersToStateMatch() {
  const statesMatcher = {};
  Object.keys(STATES).forEach((stateName) => {
    if (!statesMatcher.hasOwnProperty(stateName)) {
      const accelerometersNumber = STATES[stateName].ACTIVE_ACCELEROMETERS;
      statesMatcher[accelerometersNumber] = stateName;
    } else {
      logger.warn('getAccelerometersToStateMatch()', 'Could not register state:', stateName);
      logger.warn('getAccelerometersToStateMatch()', 'statesMatcher', statesMatcher);
    }
  });
  return statesMatcher;
}

/**
 * @param {Number} numberOfActiveAccelerometers
 * @return {String} state
 */
function convertToState(numberOfActiveAccelerometers) {
  let state = accelerometersToState[numberOfActiveAccelerometers];

  if (!state) {
    state = DEFAULT_STATE;
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
  if (RANDOM_STATE.ACTIVE === true) {
    logger.warn('------------------------------');
    logger.warn('--- RANDOM_STATE IS ACTIVE ---');
    logger.warn(`--- TRIGGER CHANGE: ${RANDOM_STATE.CHANGE_TO_ACTIVATE_ACCELEROMETER}  ---`);
    logger.warn('------------------------------');
  }
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
