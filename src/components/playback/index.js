const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const states = require(`${appRoot}/config/state-files.json`);

let isSoundPlayed = false;

/**
 * @param  {String} newState
 */
function updateState(newState) {
  const stateConf = states[newState];
  if (!stateConf) {
    logger.error('State is not supported');
    return;
  }

  if (isSoundPlayed) {
    logger.info('Could not update state - previous state hasnt finished');
    return;
  }

  logger.debug('Updating state to:', newState);
  omxController.playVideo(stateConf.videoFile.videoFilePath, stateConf.videoFile.soundFilePath);

  omxController.playSound(stateConf.soundFilePath)
    .then(() => {
      logger.debug('Sound has finished playing for state:', newState);
      updateSoundPlayed(false);
    });

  miioController.updatePowerSocket(stateConf.isPowerSocketActive);

  updateSoundPlayed(true);
}
/**
 * @param  {Boolean} isPlayed
 */
function updateSoundPlayed(isPlayed) {
  logger.debug('Updating sound playe state:', isPlayed);
  isSoundPlayed = isPlayed;
}


module.exports = {
  updateState,
};
