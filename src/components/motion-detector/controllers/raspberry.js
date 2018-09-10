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

const DEFAULT_ACCELEROMETER_DATA = {
  gyro: {
    x: 0,
    y: 0,
    z: 0,
  },
  accel: {
    x: 0,
    y: 0,
    z: 0,
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
};

/** */
function init() {
  logger.info('Initializing');
  i2c1 = i2c.openSync(1);

  setInterval(() => {
    const muxAccelerometersData = channels.map((channel) => {
      return getAccelerometerData(1 << channel, channel);
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
 * @param {Number} portNumber - channel number.
 * Will be converted to be byte, e.g. 1 << 0 - 0 channel, 1 << n - n-th channel etc.
 * @return {Object} see https://github.com/emersion/node-i2c-mpu6050
*/
function getAccelerometerData(portNumber) {
  const channel = 1 << portNumber;
  logger.debug(`getting accelerometer data for SD #${portNumber}; Channel: ${channel}`);
  // setting mux channel
  i2c1.writeByteSync(muxAddress, channel, channel);
  // reading MPU data
  if (!channelAccerometers[channel]) {
    channelAccerometers[channel] = createAccelerometerConnection();
  }
  return readAccelerometersData(portNumber, channel);
}

/**
 * creating connection with accelerometer(MPU6050)
 * @param {Number} portNumber
 * @return {MPU6050Connection}
 */
function createAccelerometerConnection(portNumber) {
  logger.debug('createAccelerometerConnection()', portNumber);
  let connection;
  try {
    connection = new MPU6050(i2c1, accelererometerAddress);
  } catch (e) {
    logger.error(`Wasnt able to connect to accelerometer on channel #${portNumber}`);
  }
  return connection;
}

/**
 * @param {Number} portNumber
 * @param {Number} channel
 * @return {Object} see https://github.com/emersion/node-i2c-mpu6050
 */
function readAccelerometersData(portNumber, channel) {
  logger.debug('readAccelerometersData()', portNumber, channel);
  let accelData;
  try {
    accelData = channelAccerometers[channel].readSync();
  } catch (e) {
    logger.error(`Wasnt able to read data from SD #${portNumber}. Setting default values..`);
    accelData = Object.assign({}, DEFAULT_ACCELEROMETER_DATA);
  }
  return accelData;
}
module.exports = {
  init,
  updateCb,
};
