const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const i2c = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

const muxAddress = parseInt(ACCELEROMETER.MUX_PORT, 16);
const accelererometerAddress = parseInt(ACCELEROMETER.ACCELEROMETER_PORT, 16);
const channels = ACCELEROMETER.CHANNELS;
const channelAccerometers = {};
let callback;
let i2c1;

/** */
function init() {
  logger.info('Initializing');
  i2c1 = i2c.openSync(1);

  setInterval(() => {
    const muxAccelerometersData = channels.map((channel) => {
      return getAccelerometerData(1 << channel);
    });
    callback(muxAccelerometersData);
  }, 500);
}

/**
 * @param {Function} cb
 */
function updateCb(cb) {
  logger.debug('Updating callback function');
  callback = cb;
}

/**
 * @param {Number} channel - channel number, should be byte, e.g. 1 << 0 - 0 channel, 1 << n - n-th channel etc.
 * @return {Object} see https://github.com/emersion/node-i2c-mpu6050
*/
function getAccelerometerData(channel) {
  logger.debug('getting accelerometer data for channel:', channel);
  // setting mux channel
  i2c1.writeByteSync(muxAddress, channel, channel);
  // reading MPU data
  if (!channelAccerometers[channel]) {
    channelAccerometers[channel] = new MPU6050(i2c1, accelererometerAddress);
  }
  return channelAccerometers[channel].readSync();
}


module.exports = {
  init,
  updateCb,
};
