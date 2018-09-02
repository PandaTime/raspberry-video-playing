const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const i2c = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');

const muxAddress = 0x70;
const accelererometerAddress = 0x68;
const channelAccerometers = {};
const channels = [0];//, 1, 2, 3, 4, 5];

logger.info('Initializing');
const i2c1 = i2c.openSync(1);

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

/**
 * @param {Function} cb - passing to cb list of accelerometer data
 * @return {Number} timeoutInterval
*/
function listenAccelerometers(cb) {
  return setInterval(() => {
    const muxAccelerometersData = channels.map((channel) => {
      return getAccelerometerData(1 << channel);
    });
    cb(muxAccelerometersData);
  }, 500);
}


module.exports = {
  listenAccelerometers,
};
