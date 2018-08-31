const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('omx-player');
const omxp = require('omxplayer-controll');

/** */
class Player {
  /** */
  constructor() {
    this.id = (new Date()).getTime();
    logger.debug('initializing');
    this.isPlaying = true;
  }
  /**
   * @param {String} filePath
   * @param {Object} options - see https://github.com/winstonwp/omxplayer-controll#usage
   */
  startPlayer(filePath, options) {
    logger.debug('Passed options', JSON.stringify(options));
    const defaultOptions = {
      nativeLoop: true,
    };

    const settings = Object.assign({}, defaultOptions, options);

    logger.debug('Path to file:', filePath);
    logger.debug('Start Player with such settings:', JSON.stringify(settings));

    this.omxPlayer = omxp.open(filePath, settings);
  }
  /**
   * @param {Function} cb
   */
  setUpdatesListener(cb) {
    logger.debug('listenForUpdated');
    setInterval(() => {
      omxp.getPosition(cb);
    }, 1000);
  }

  /**
   * @param {Boolean} shouldPlay
   */
  setPlayStatus(shouldPlay) {
    if (this.isPlaying === shouldPlay) {
      logger.debug('Player is already in the same status:', shouldPlay);
      return;
    }
    logger.debug('Updating "isPlayed" status to:', shouldPlay);
    this.isPlaying = shouldPlay;
    omxp.playPause();
  }

  /**
   * Setting play time of the file
   * @param {Number} playTime - time in microseconds
   */
  setPlayTime(playTime) {
    if (isNaN(playTime)) {
      logger.error(`${this.id} setPlayTime() not a number: ${playTime}`);
      return;
    }
    logger.debug(`Setting ${this.id} player's play time to: ${playTime}`);
    omxp.setPosition(playTime, (err) => {
      if (err) {
        logger.error(`Wasnt able to setPosition(${playTime}) for: ${this.id}`);
      }
    });
  }
}

/**
 * Opening sound file in loop and stopping it immediately
 * @param {String} filePath
 * @return {OmxPlayer}
 */
function openVideoFile(filePath) {
  const player = new Player();
  player.startPlayer(filePath, {
    audioOutput: 'hdmi',
    otherArgs: {
      layer: 1,
    },
  });
  return player;
}

/**
 * Opening sound file in loop and stopping it immediately
 * @param  {String} filePath
 * @return {OmxPlayer}
 */
function openSoundFile(filePath) {
  const player = new Player();
  player.startPlayer(filePath, {
    audioOutput: 'local',
    otherArgs: {
      layer: 1,
    },
  });
  return player;
}

module.exports = {
  openVideoFile,
  openSoundFile,
};
