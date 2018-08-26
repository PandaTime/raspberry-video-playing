// Import the module.
const omx = require('node-omxplayer');
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const logger = require(`${appRoot}/utils/logger`)('omx-player');

/** Listening for current omxplayer status
 * @param  {OMX<Player>} omxPlayer
 * @param {Function} cb - callback to trigger when playback has ended.
 * @return {Promise}
 */
function _listenOnEnd(omxPlayer, cb) {
  const promise = new Promise((res, rej) => {
    const interval = setInterval(() => {
      omxPlayer.debug('File has reached its end');
      // ?!?!??!
      clearInterval(interval);
      cb();
    }, 50);
  });
  return promise;
}

/**
 * @param  {String} filePath - path to file that should be played
 * @param  {String} outputChannel - type of data output
 * @param {String} initialVolume - https://www.npmjs.com/package/node-omxplayer#omx-source--output--loop--initialvolume-
 * @return {Promise} promise that will trigger on end.
 * @private
 */
function _startPlayer(filePath, outputChannel, initialVolume) {
  if (!filePath) {
    logger.error('No file was specified');
    throw new Error('No file was specified');
  }
  logger.debug(`_startPlayer("${filePath}"; outputChannel: "${outputChannel}"; initialVolume: "${initialVolume}")`);
  // Create an instance of the player with the source.
  const omxPlayer = omx(filePath, outputChannel, initialVolume);
  return _listenOnEnd(omxPlayer);
}

/**
 * Starts video play
 * @param {String} videoFilePath
 * @param {String} videoSoundFilePath
 * @return {{video, videoSound}} promises - will resolve on player end
 */
function playVideo(videoFilePath, videoSoundFilePath) {
  logger.debug('Playing video:', videoFilePath, videoSoundFilePath);
  const video = _startPlayer(videoFilePath, 'hdmi');
  const videoSound = _startPlayer(videoSoundFilePath, 'local');
  return {
    video,
    videoSound,
  };
}

/**
 * Starts video play
 * @param {String} soundFilePath
 * @return {Promise} promise - will resolve on player end
 */
function playSound(soundFilePath) {
  logger.debug('Playing sound:', soundFilePath);
  return _startPlayer(soundFilePath, 'local');
}

module.exports = {
  playVideo,
  playSound,
};
