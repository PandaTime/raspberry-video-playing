const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('motion-detector/index');
const raspberryController = require('./controllers/raspberry');

const possibleDelta = 0.1;
let previousAccelerometerData;
let activeAccelerometers = 0;

raspberryController.updateCb(onAccelerometerData);

/**
 * @param {Array<Object>} accelerometers - for more info see https://github.com/emersion/node-i2c-mpu6050
 */
function onAccelerometerData(accelerometers) {
  logger.debug('Data from accelerometer', accelerometers);
  if (!previousAccelerometerData) {
    logger.info('Initial start');
    previousAccelerometerData = accelerometers;
    return;
  } else if (previousAccelerometerData.length !== accelerometers.length) {
    logger.warn('Different number of accelerometers', previousAccelerometerData, accelerometers);
    previousAccelerometerData = accelerometers;
    return;
  }

  activeAccelerometers = accelerometers.filter((acceloremeter, i) => {
    const gyro = accelerometers.gyro;
    const previousGyro = previousAccelerometerData[i].gyro;
    let isActive = false;
    if (Math.abs(gyro.x - previousGyro.x) > possibleDelta ||
      Math.abs(gyro.y - previousGyro.y) > possibleDelta ||
      Math.abs(gyro.z - previousGyro.z) > possibleDelta
    ) {
      isActive = true;
    }
    return isActive;
  }).length;
  logger.debug('active accelerometers:', activeAccelerometers);
}

/**
 */
function onActiveAccelerometersChange(cb) {
  setInterval(function() {}, 500);
}

module.exports = {
  onActiveAccelerometersChange,
};
