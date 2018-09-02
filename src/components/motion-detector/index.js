const fs = require('fs');
const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('motion-detector/index');
const raspberryController = require('./controllers/raspberry');
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

let maxGyroDelta = ACCELEROMETER.MAX_GYRO_DELTA;
let previousAccelerometerData;
let activeAccelerometers = 0;
let previouslyActiveAccelerometers = 0;

raspberryController.updateCb(onAccelerometerData);

watchConfigurationFileChange();

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

  activeAccelerometers = accelerometers.filter((accelerometer, i) => {
    const gyro = accelerometer.gyro;
    const previousGyro = previousAccelerometerData[i].gyro;
    let isActive = false;
    if (Math.abs(gyro.x - previousGyro.x) > maxGyroDelta ||
      Math.abs(gyro.y - previousGyro.y) > maxGyroDelta ||
      Math.abs(gyro.z - previousGyro.z) > maxGyroDelta
    ) {
      isActive = true;
    }
    return isActive;
  }).length;
  logger.debug('active accelerometers:', activeAccelerometers);
}

/**
 * @param {Function<Number>} cb - called every time when number of accelerometers change. call it with # of active accel
 */
function onActiveAccelerometersChange(cb) {
  setInterval(function() {
    if (previouslyActiveAccelerometers !== activeAccelerometers) {
      logger.debug(`number of accelerometers updated: ${previousAccelerometerData} -> ${activeAccelerometers}`);
      previouslyActiveAccelerometers = activeAccelerometers;
      cb(activeAccelerometers);
    }
  }, 500);
}


/**
 * Watching config file change to dynamically update max delta values to check whether accelerometers changed
 */
function watchConfigurationFileChange() {
  fs.watchFile(`${appRoot}/config/configuration.json`, { encoding: 'buffer' }, (eventType, filename) => {
    if (!filename) return;
    fs.readFile(`${appRoot}/config/configuration.json`, (err, data) => {
      if (err) {
        logger.error('Could not read config file:', err);
        return;
      }
      try {
        const newGyroDelta = JSON.parse(data.toString()).ACCELEROMETER.MAX_GYRO_DELTA;
        if (!isNaN(newGyroDelta)) {
          logger.info(`Updating delta accelerometer: ${maxGyroDelta} -> ${newGyroDelta}`);
          maxGyroDelta = newGyroDelta;
        } else {
          logger.error('Wasnt able to update gyro delta: not a number.', typeof newGyroDelta, newGyroDelta);
        }
      } catch (err) {
        logger.error('Wasnt able to update gyro delta:', err);
        return;
      }
    });
  });
}


module.exports = {
  onActiveAccelerometersChange,
};
