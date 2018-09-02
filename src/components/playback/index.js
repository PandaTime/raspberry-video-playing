const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const { FILE_PATHS, STATES, DEFAULT_STATE } = require(`${appRoot}/config/configuration.json`);

let isStatusChangeable = true;
let currentState = DEFAULT_STATE;
let video;
let videoSound;
let sound;

/** */
function init() {
  miioController.connect();
  video = omxController.openVideoFile({
    filePath: FILE_PATHS.VIDEO_FILE,
    autoRestart: true,
  });
  logger.info('Initialized Video:', video.id);

  videoSound = omxController.openSoundFile({
    filePath: FILE_PATHS.VIDEO_SOUND_FILE,
    autoRestart: true,
  });
  logger.info('Initialized Video Sound:', videoSound.id);

  // In fact we need only this cb listener
  sound = omxController.openSoundFile({
    filePath: FILE_PATHS.SOUND_FILE,
    autoRestart: false,
  });
  sound.setUpdatesListener((data) => {
    logger.debug(`layer is at ${data.position} / ${data.duration}; currently ${data.status}`);
    if (!isStatusChangeable && data.position > STATES[currentState].SOUND.SOUND_END_TIME) {
      updateStatus(true);
      updateState(DEFAULT_STATE);
    }
  });
  logger.info('Initialized Sound:', sound.id);
  updateState(DEFAULT_STATE);
}

/** */
function updateOmxPlayer() {
  const currentStateConfig = STATES[currentState];

  if (currentStateConfig) {
    video.setPlayFrames({
      start: currentStateConfig.VIDEO.VIDEO_START_TIME,
      end: currentStateConfig.VIDEO.VIDEO_END_TIME,
    });
    videoSound.setPlayFrames({
      start: currentStateConfig.VIDEO.AUDIO_START_TIME,
      end: currentStateConfig.VIDEO.AUDIO_END_TIME,
    });
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
  init,
  updateState,
};
