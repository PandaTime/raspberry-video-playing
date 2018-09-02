const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('omx-player');
const Omx = require('omx-layers');

/** */
class Player {
  /**
   * @param {Boolean} autoRestartStatePlayback - whether we should restart STATE play, when reaching state's end time
   * @param {Boolean} pauseOnStart - whether it should be paused on start
  */
  constructor(autoRestartStatePlayback, pauseOnStart) {
    this.id = (new Date()).getTime();
    logger.debug(`initializing ${this.id}..`);
    logger.debug(`${this.id} autoRestartStatePlayback:`, autoRestartStatePlayback);
    this.hasStarted = false;
    this.isPlaying = true;
    this.cb = function() {};
    this.startTime = 0;
    this.endTime = Infinity;
    this.autoRestartStatePlayback;
    this.pauseOnStart = pauseOnStart;
  }
  /**
   * @param {String} filePath
   * @param {Object} options - see https://github.com/winstonwp/omxplayer-controll#usage
   */
  startPlayer(filePath, options) {
    logger.debug('startPlayer()', 'Passed options', JSON.stringify(options));
    const defaultOptions = {
      loop: true,
    };

    const settings = Object.assign({}, defaultOptions, options);

    logger.debug('startPlayer()', 'Path to file:', filePath);
    logger.debug('startPlayer()', 'Start Player with such settings:', JSON.stringify(settings));

    this.omxPlayer = new Omx(settings);
    this.omxPlayer.open(filePath);

    this.omxPlayer.onStart(() => {
      this.hasStarted = true;
      if (this.pauseOnStart) {
        this._setPlayStatus(false);
      }
      logger.info('startPlayer()', `Player ${this.id} has started`);
    });
    this.omxPlayer.onProgress((info) => {
      this.cb(info);
      // will output something like: layer is at 2500 / 10000; currently playing
      if (info.position < this.endTime) return;
      if (this.autoRestartStatePlayback) {
        logger.debug('startPlayer()', `${this.id}: Player reached its end time. restarting..`);
        this._setPlayTime(this.startTime);
      } else {
        this._setPlayStatus(false);
        logger.debug('startPlayer()', `${this.id}: Player reached its end time. Not restarting.`);
      }
    });
  }

  /**
   * @param {*} param0
   */
  setPlayFrames({ start, end, startPlay }) {
    logger.debug('setPlayFrames()', `${this.id} Setting start: ${start}; end ${end} times`);
    this.startTime = start;
    this.endTime = end;
    this._setPlayTime(start);
    if (startPlay) {
      this._setPlayStatus(startPlay);
    }
  }
  /**
   * @param {Function} cb
   */
  setUpdatesListener(cb) {
    logger.debug('setPlayFrames(), listenForUpdated');
    this.cb = cb;
  }

  /**
   * @param {Boolean} shouldPlay
   * @private
   */
  _setPlayStatus(shouldPlay) {
    if (this.isPlaying === shouldPlay) {
      logger.debug('setPlayStatus()', 'Player is already in the same status:', shouldPlay);
      return;
    }
    logger.debug('setPlayStatus()', 'Updating "isPlayed" status to:', shouldPlay);
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
  _setPlayTime(playTime) {
    if (!this.hasStarted) {
      logger.warn('setPlayTime()', 'Could not setPlaytime: omx-player hasnt started yet');
      return;
    }
    if (isNaN(playTime)) {
      logger.error('setPlayTime()', `${this.id} not a number: ${playTime}`);
      return;
    }
    logger.debug('setPlayTime()', `Setting ${this.id} player's play time to: ${playTime}`);
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
 * @param  {{filePath, autoRestart, pauseOnStart}} filePath
 * @return {OmxPlayer}
 */
function openSoundFile({ filePath, autoRestart, pauseOnStart }) {
  const player = new Player(autoRestart, pauseOnStart);
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
