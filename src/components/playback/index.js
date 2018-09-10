const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const { FILE_PATHS, STATES, DEFAULT_STATE, MIIO } = require(`${appRoot}/config/configuration.json`);

let isStatusChangeable = true;
let currentState = DEFAULT_STATE;
let lastState = DEFAULT_STATE;
let video;
let videoSound;
let sound;

/** */
function init() {
  miioController.connect(MIIO.HOST, MIIO.TOKEN);
  video = omxController.openVideoFile({
    filePath: FILE_PATHS.VIDEO_FILE,
    autoRestart: true,
    name: 'Video Video',
    layer: 4,
    output: 'hdmi',
  });
  logger.info('Initialized Video:', video.id);

  videoSound = omxController.openSoundFile({
    filePath: FILE_PATHS.VIDEO_SOUND_FILE,
    autoRestart: true,
    layer: 3,
    name: 'Video Sound',
    output: 'local',
  });
  logger.info('Initialized Video Sound:', videoSound.id);

  sound = omxController.openSoundFile({
    filePath: FILE_PATHS.SOUND_FILE,
    autoRestart: false,
    layer: 1,
    name: 'Sound Sound',
    output: 'local',
  });
  sound.setUpdatesListener((data) => {
    logger.debug(`layer is at ${data.position} / ${data.duration}; currently ${data.status}`);
    if (!isStatusChangeable && data.position > STATES[currentState].SOUND.SOUND_END_TIME) {
      updateStatus(true);
      updateState(lastState);
    }
  });
  logger.info('Initialized Sound:', sound.id);
}

/**
 * @param {String} newState
*/
function updateOmxPlayer(newState) {
  logger.debug('updateOmxPlayer() for state:', newState);
  const currentStateConfig = STATES[newState];

  if (currentStateConfig) {
    sound.setPlayFrames({
      start: currentStateConfig.SOUND.SOUND_START_TIME,
      end: currentStateConfig.SOUND.SOUND_END_TIME,
      shouldPlay: currentStateConfig.SOUND.SHOUND_PLAY,
    });
    if (newState === currentState) {
      logger.debug('updateOmxPlayer() State is the same updating only sound', newState);
      return;
    }

    logger.debug(`updateOmxPlayer() State changed, updating video and video sound to state ${newState}`);
    video.setPlayFrames({
      start: currentStateConfig.VIDEO.VIDEO_START_TIME,
      end: currentStateConfig.VIDEO.VIDEO_END_TIME,
    });
    videoSound.setPlayFrames({
      start: currentStateConfig.VIDEO.AUDIO_START_TIME,
      end: currentStateConfig.VIDEO.AUDIO_END_TIME,
    });
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
    logger.debug(
      `Could not update state - previous state(${currentState}) hasnt finished.`);
    lastState = newState;
    logger.info(`Accelerometers state updated: ${lastState} -> ${newState}`);
    return;
  }

  updateStatus(currentState === DEFAULT_STATE);
  updateOmxPlayer(newState);
  currentState = newState;
  if (stateConf.POWER_SOCKET) {
    miioController.updatePowerSocket(stateConf.POWER_SOCKET.SHOULD_WORK);
  } else {
    logger.error(`Could not update power socker: "stateConf.POWER_SOCKET" is ${typeof stateConf.POWER_SOCKET};`,
      stateConf.POWER_SOCKET);
  }
}

/**
 * @param  {Boolean} changeable
 */
function updateStatus(changeable) {
  logger.debug('Updating "isChangeable" status to :', changeable);
  isStatusChangeable = changeable;
  // if (!isStatusChangeable) {
  //   setTimeout(() => {
  //     isStatusChangeable = true;
  //     logger.info('TRUEEEE');
  //   }, 5000);
  // }
}


module.exports = {
  init,
  updateState,
};
