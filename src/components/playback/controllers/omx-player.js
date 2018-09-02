const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('omx-player');
const Omx = require('omx-layers');

const MILLISECONDS_IN_SECONDS = 1000;
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
    this.autoRestartStatePlayback = autoRestartStatePlayback;
    this.pauseOnStart = pauseOnStart;

    this._onStartStatusCheckInitialized = false;
  }
  /**
   * Could stop onStart() cb, therefore we need to "on start pause" here.
   * @param {String} status
   */
  _onStartPlayStatusCheck(status) {
    if (this._onStartStatusCheckInitialized) return;
    if (status === 'playing' && this.pauseOnStart) {
      this._setPlayStatus(false);
    }
  }

  /**
   * @param {String} filePath
   * @param {Object} options - see https://github.com/winstonwp/omxplayer-controll#usage
   */
  startPlayer(filePath, options) {
    logger.debug('startPlayer()', this.id, 'Passed options', JSON.stringify(options));
    const defaultOptions = {
      loop: true,
      disableOnScreenDisplay: true,
    };

    const settings = Object.assign({}, defaultOptions, options);

    logger.debug('startPlayer()', this.id, 'Path to file:', filePath);
    logger.debug('startPlayer()', this.id, 'Start Player with such settings:', JSON.stringify(settings));

    this.omxPlayer = new Omx(settings);
    this.omxPlayer.open(filePath);

    this.omxPlayer.onStart(() => {
      this.hasStarted = true;
      logger.info('startPlayer()', this.id, 'Player has started');
    });
    this.omxPlayer.onProgress((info) => {
      this._onStartPlayStatusCheck(info.status);
      const infoInSeconds = {
        position: info.position / MILLISECONDS_IN_SECONDS,
        duration: info.duration / MILLISECONDS_IN_SECONDS,
        status: info.status,
      };
      // logger.debug(`layer is at ${data.position} / ${data.duration}; currently ${data.status}`);
      this.cb(infoInSeconds);
      // will output something like: layer is at 2500 / 10000; currently playing
      if (infoInSeconds.position < this.endTime) {
        logger.debug('startPlayer()',
          `${this.id}: Updated position ${infoInSeconds.position}. Endtime: ${this.endTime}`);
        return;
      }
      if (this.autoRestartStatePlayback) {
        logger.debug('startPlayer()', `${this.id}: Player reached its end time. restarting..`);
        logger.debug('startPlayer()', `${this.id}: Current ${infoInSeconds.position}. End: ${this.endTime}.`);
        this._setPlayTime(this.startTime);
      } else if (this.isPlaying) {
        logger.debug('startPlayer()', `${this.id}: Player reached its end time. Not restarting.`);
        logger.debug('startPlayer()', `${this.id}: Current ${infoInSeconds.position}. End: ${this.endTime}.`);
        this._setPlayStatus(false);
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
    if (startPlay !== undefined) {
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
      logger.debug('setPlayStatus()', this.id, 'Player is already in the same status:', shouldPlay);
      return;
    }
    logger.debug('setPlayStatus()', this.id, 'Updating "isPlayed" status to:', shouldPlay);
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
      logger.warn('setPlayTime()', this.id, 'Could not setPlaytime: omx-player hasnt started yet');
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
