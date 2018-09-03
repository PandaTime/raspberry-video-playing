const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('omx-player');
const Omx = require('omx-layers');
const { FIRST_STATUS_CHANGE_DELAY } = require(`${appRoot}/config/configuration.json`);

const MILLISECONDS_IN_SECONDS = 1000;
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
    this.endTime = 5;
    this.autoRestartStatePlayback = autoRestartStatePlayback;

    this.currentTime = 0;
    this._onStartStatusCheckInitialized = false;
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
      // Even though it should ready for work it's not(Fast writes to omxplayer can cause critical errors)
      setTimeout(() => {
        this.hasStarted = true;
        logger.info('startPlayer()', this.id, 'Started after timeout');
      }, FIRST_STATUS_CHANGE_DELAY);
      logger.info('startPlayer()', this.id, 'Player has started. Waiting for:', FIRST_STATUS_CHANGE_DELAY);
    });
    this.omxPlayer.onProgress((info) => {
      const infoInSeconds = {
        position: info.position / MILLISECONDS_IN_SECONDS,
        duration: info.duration / MILLISECONDS_IN_SECONDS,
        status: info.status,
      };
      this.currentTime = infoInSeconds.position;

      logger.debug(this.id,
        `layer is at ${infoInSeconds.position} / ${infoInSeconds.duration}; currently ${infoInSeconds.status}`);
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
      }
    });
  }

  /**
   * @param {*} param0
   */
  setPlayFrames({ start, end, shouldPlay }) {
    logger.debug('setPlayFrames()', `${this.id} Setting start: ${start}; end ${end} times`);
    this.startTime = start;
    this.endTime = end;

    // for better ux
    if (shouldPlay !== undefined && shouldPlay === false) {
      this._setPlayStatus(shouldPlay);
    }

    this._setPlayTime(start);

    if (shouldPlay !== undefined && shouldPlay === true) {
      this._setPlayStatus(shouldPlay);
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
    // Otherwise omxplayer lags and goes to 0 location and stops
    if (playTime < this.currentTime) {
      this.omxPlayer.setAbsolute(0);
    }
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
    layer: 2,
  });
  return player;
}

/**
 * Opening sound file in loop and stopping it immediately
 * @param  {{filePath, autoRestart}} filePath
 * @return {OmxPlayer}
 */
function openSoundFile({ filePath, autoRestart, layer }) {
  const player = new Player(autoRestart);
  player.startPlayer(filePath, {
    audioOutput: 'local',
    layer,
  });
  return player;
}

module.exports = {
  openVideoFile,
  openSoundFile,
};
