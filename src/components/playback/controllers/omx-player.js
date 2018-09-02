const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('omx-player');
const Omx = require('omx-layers');

/** */
class Player {
  /**
   * @param {Boolean} autoRestartStatePlayback - whether we should restart STATE play, when reaching state's end time
  */
  constructor(autoRestartStatePlayback) {
    this.id = (new Date()).getTime();
    logger.debug(`initializing ${this.id}..`);
    logger.debug(`${this.id} autoRestartStatePlayback:`, autoRestartStatePlayback);
    this.hasStarted = false;
    this.isPlaying = true;
    this.cb = function() {};
    this.startTime = 0;
    this.endTime = Infinity;
    this.autoRestartStatePlayback;
  }
  /**
   * @param {String} filePath
   * @param {Object} options - see https://github.com/winstonwp/omxplayer-controll#usage
   */
  startPlayer(filePath, options) {
    logger.debug('Passed options', JSON.stringify(options));
    const defaultOptions = {
      loop: true,
    };

    const settings = Object.assign({}, defaultOptions, options);

    logger.debug('Path to file:', filePath);
    logger.debug('Start Player with such settings:', JSON.stringify(settings));

    this.omxPlayer = new Omx(settings);
    this.omxPlayer.open(filePath);

    this.omxPlayer.onStart(() => {
      this.hasStarted = true;
      logger.info(`Player ${this.id} has started`);
    });
    this.omxPlayer.onProgress((info) => {
      this.cb(info);
      // will output something like: layer is at 2500 / 10000; currently playing
      if (info.position < this.endTime) return;
      if (this.autoRestartStatePlayback) {
        logger.debug(`${this.id}: Player reached its end time. restarting..`);
        this.setPlayTime(this.startTime);
      } else {
        logger.debug(`${this.id}: Player reached its end time. Not restarting.`);
      }
    });
  }

  /**
   * @param {*} param0
   */
  setPlayFrames({ start, end }) {
    logger.debug(`${this.id} Setting start: ${start}; end ${end} times`);
    this.startTime = start;
    this.endTime = end;
  }
  /**
   * @param {Function} cb
   */
  setUpdatesListener(cb) {
    logger.debug('listenForUpdated');
    this.cb = cb;
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
    if (shouldPlay) {
      this.omxPlayer.resume();
    } else {
      this.omxPlayer.pause();
    }
  }

  /**
   * Setting play time of the file
   * @param {Number} playTime - time in microseconds
   */
  setPlayTime(playTime) {
    if (!this.hasStarted) {
      logger.warn('Could not setPlaytime: omx-player hasnt started yet');
      return;
    }
    if (isNaN(playTime)) {
      logger.error(`${this.id} setPlayTime() not a number: ${playTime}`);
      return;
    }
    logger.debug(`Setting ${this.id} player's play time to: ${playTime}`);
    this.omxPlayer.setAbsolute(playTime);
  }
}

/**
 * Opening sound file in loop and stopping it immediately
 * @param {{filePath, autoRestart}} filePath
 * @return {OmxPlayer}
 */
function openVideoFile({ filePath, autoRestart }) {
  const player = new Player(autoRestart);
  player.startPlayer(filePath, {
    audioOutput: 'hdmi',
    layer: 1,
  });
  return player;
}

/**
 * Opening sound file in loop and stopping it immediately
 * @param  {{filePath, autoRestart}} filePath
 * @return {OmxPlayer}
 */
function openSoundFile({ filePath, autoRestart }) {
  const player = new Player(autoRestart);
  player.startPlayer(filePath, {
    audioOutput: 'local',
    layer: 0,
  });
  return player;
}

module.exports = {
  openVideoFile,
  openSoundFile,
};
