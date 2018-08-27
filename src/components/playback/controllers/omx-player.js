// Import the module.
const appRoot = require('app-root-path');
const omx = require(`${appRoot}/libs/node-omxplayer`);
const Promise = require('bluebird');
const logger = require(`${appRoot}/utils/logger`)('omx-player');

/** Listening for current omxplayer status
 * @param  {OMX<Player>} omxPlayer
 * @param {Function} cb - callback to trigger when playback has ended.
 * @return {Promise}
 */
function _listenOnEnd(omxPlayer) {
  const promise = new Promise((res, rej) => {
    const interval = setInterval(() => {
      logger.debug('File has reached its end:', omxPlayer.info());
      // ?!?!??!
      clearInterval(interval);
      res();
    }, 50);
  });
  return promise;
}

/**
 * @param  {String} filePath - path to file that should be played
 * @param  {String} outputChannel - type of data output
 * @param {String} initialVolume - https://www.npmjs.com/package/node-omxplayer#omx-source--output--loop--initialvolume-
 * @param {Number} layer
 * @return {Promise} promise that will trigger on end.
 * @private
 */
function _startPlayer(filePath, outputChannel, initialVolume, layer) {
  if (!filePath) {
    logger.error('No file was specified');
    return new Promise(function(res) {
      res();
    });
  }
  logger.debug(`_startPlayer("${filePath}"; outputChannel: "${outputChannel}"; initialVolume: "${initialVolume}")`);
  // Create an instance of the player with the source.
  const omxPlayer = omx(filePath, outputChannel, undefined, initialVolume, layer);
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
  const video = _startPlayer(videoFilePath, 'hdmi', 1);
  const videoSound = _startPlayer(videoSoundFilePath, 'local', 0, 0);
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
  return _startPlayer(soundFilePath, 'local', 0, 0);
}

module.exports = {
  playVideo,
  playSound,
};
