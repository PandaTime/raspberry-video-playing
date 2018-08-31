const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const { VIDEO, STATES, DEFAULT_STATE } = require(`${appRoot}/config/state-files.json`);

let isStatusChangeable = true;
let currentState = DEFAULT_STATE;


// const video = omxController.openVideoFile(VIDEO.VIDEO_FILE);
// logger.info('Initialized Video:', video.id);

// const videoSound = omxController.openSoundFile('filePath');
// logger.info('Initialized Video Sound:', videoSound.id);

// In fact we need only this cb listener
const sound = omxController.openSoundFile(VIDEO.VIDEO_FILE);
sound.setUpdatesListener(function(err, data) {
  if (err) {
    logger.error('Error on update listener:', err);
    return;
  }
  console.log('New data:', typeof data, data);
  const curTime = parseInt(data);
  if (!isStatusChangeable && curTime > STATES[currentState]) {
    updateState(DEFAULT_STATE);
  }
});
logger.info('Initialized Sound:', sound.id);

/**
 * @param  {String} newState
 */
function updateState(newState) {
  logger.debug('updateState()', newState);
  const stateConf = STATES[newState];
  if (!stateConf) {
    logger.error('State is not supported');
    return;
  }

  if (!isStatusChangeable) {
    logger.debug('Could not update state - previous state hasnt finished');
    return;
  }

  logger.debug('Updating state to:', newState);
  currentState = newState;
  miioController.updatePowerSocket(stateConf.isPowerSocketActive);
  updateStatus(currentState === DEFAULT_STATE);
}

/**
 * @param  {Boolean} changeAble
 */
function updateStatus(changeAble) {
  logger.debug('Updating sound playe state:', changeAble);
  isStatusChangeable = changeAble;
}


module.exports = {
  updateState,
};
