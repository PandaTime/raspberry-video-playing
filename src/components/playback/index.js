const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('playback/index');
const omxController = require('./controllers/omx-player');
const miioController = require('./controllers/miio');
const { VIDEO } = require(`${appRoot}/config/state-files.json`);

let isSoundPlayed = false;
initializeVideoAndSoundFiles();

/**
 * Opening all video and sound files
 */
function initializeVideoAndSoundFiles() {

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
    console.log('New data:', data);
  });
  logger.info('Initialized Sound:', sound.id);
}

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
      updateSoundStatus(false);
    });

  miioController.updatePowerSocket(stateConf.isPowerSocketActive);

  updateSoundStatus(true);
}

/**
 * @param  {Boolean} isPlayed
 */
function updateSoundStatus(isPlayed) {
  logger.debug('Updating sound playe state:', isPlayed);
  isSoundPlayed = isPlayed;
}


module.exports = {
  updateState,
};
