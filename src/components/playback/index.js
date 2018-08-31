const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const { VIDEO, STATES, DEFAULT_STATE } = require(`${appRoot}/config/state-files.json`);

let isStatusChangeable = true;
let currentState = DEFAULT_STATE;
let video;
let videoSound;
let sound;

init();

/** */
function init() {
  // const video = omxController.openVideoFile(VIDEO.VIDEO_FILE);
  // logger.info('Initialized Video:', video.id);

  // const videoSound = omxController.openSoundFile('filePath');
  // logger.info('Initialized Video Sound:', videoSound.id);

  // In fact we need only this cb listener
  sound = omxController.openSoundFile(VIDEO.VIDEO_FILE);
  sound.setUpdatesListener((data) => {
    logger.debug(`layer is at ${data.position} / ${data.duration}; currently ${data.status}`);
    if (!isStatusChangeable && data.position > STATES[currentState].SOUND.SOUND_END_TIME) {
      updateStatus(true);
      updateState(DEFAULT_STATE);
    }
  });
  logger.info('Initialized Sound:', sound.id);
}

/** */
function updateOmxPlayer() {
  const currentStateConfig = STATES[currentState];

  if (currentStateConfig) {
    sound.setPlayStatus(currentStateConfig.SOUND.SHOUND_PLAY);
    if (currentStateConfig.SOUND.SHOUND_PLAY) {
      sound.setPlayTime(currentStateConfig.SOUND.SOUND_START_TIME);
    }
  }
}

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

  updateStatus(currentState === DEFAULT_STATE);

  updateOmxPlayer();

  miioController.updatePowerSocket(stateConf.isPowerSocketActive);
}

/**
 * @param  {Boolean} changeable
 */
function updateStatus(changeable) {
  logger.debug('Updating "isChangeable" status to :', changeable);
  isStatusChangeable = changeable;
}


module.exports = {
  updateState,
};
