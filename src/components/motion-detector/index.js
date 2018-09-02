const fs = require('fs');
const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('motion-detector/index');
const raspberryController = require('./controllers/raspberry');
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

let gyroDelta = ACCELEROMETER.GYRO_DELTA;
let rotationDelta = ACCELEROMETER.ROTATION_DELTA;
let previousAccelerometerData = [];
let numberOfActiveAccelerometers = 0;
let hasNumberChanged = false;

/** */
function init() {
  raspberryController.init();
  raspberryController.updateCb(onAccelerometerData);

  watchConfigurationFileChange();
}

/**
 * @param {Array<Object>} accelerometers - for more info see https://github.com/emersion/node-i2c-mpu6050
 */
function onAccelerometerData(accelerometers) {
  logger.debug('Data from accelerometer', JSON.stringify(accelerometers));
  if (!previousAccelerometerData) {
    logger.info('Initial start');
    previousAccelerometerData = accelerometers;
    return;
  } else if (previousAccelerometerData.length !== accelerometers.length) {
    logger.warn('Different number of accelerometers', previousAccelerometerData, accelerometers);
    previousAccelerometerData = accelerometers;
    return;
  }

  const activeAccelerometers = accelerometers.map((accelerometer, i) => {
    const gyro = accelerometer.gyro;
    const rotation = accelerometer.rotation;
    const previousGyro = previousAccelerometerData[i].gyro;
    const previousRotation = previousAccelerometerData[i].rotation;
    let isActive = false;
    if (
      Math.abs(gyro.x - previousGyro.x) > gyroDelta ||
      Math.abs(gyro.y - previousGyro.y) > gyroDelta ||
      Math.abs(gyro.z - previousGyro.z) > gyroDelta
    ) {
      logger.debug('Gyro active:', i);
      isActive = true;
    } else if (
      Math.abs(rotation.x - previousRotation.x) > rotationDelta ||
      Math.abs(rotation.y - previousRotation.y) > rotationDelta ||
      Math.abs(rotation.z - previousRotation.z) > rotationDelta
    ) {
      logger.debug('Rotation active:', i);
      isActive = true;
    }
    return isActive;
  });

  const numActiveAccel = activeAccelerometers.filter((v) => v).length;

  logger.debug('number of active accelerometers:', numActiveAccel);
  logger.debug('active accelerometers:', activeAccelerometers);

  if (numActiveAccel !== numberOfActiveAccelerometers) {
    logger.debug(`number of accelerometers updated: ${numActiveAccel} -> ${numberOfActiveAccelerometers}`);
    hasNumberChanged = true;
    previousAccelerometerData = accelerometers;
  }
}

/**
 * @param {Function<Number>} cb - called every time when number of accelerometers change. call it with # of active accel
 */
function onActiveAccelerometersChange(cb) {
  setInterval(function() {
    if (hasNumberChanged) {
      hasNumberChanged = false;
      cb(numberOfActiveAccelerometers);
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
      updateAccelerometerDeltas(JSON.parse(data.toString()).ACCELEROMETER);
    });
  });
}

/**
 * @param {Object} ACCELEROMETER
 */
function updateAccelerometerDeltas(ACCELEROMETER) {
  logger.info('Configuration changed. Checking whether deltas has changed');
  const newGyroDelta = ACCELEROMETER && ACCELEROMETER.GYRO_DELTA;
  const newRotationDelta = ACCELEROMETER && ACCELEROMETER.ROTATION_DELTA;

  if (!isNaN(newGyroDelta)) {
    if (newGyroDelta !== gyroDelta) {
      logger.info(`Updating gyro delta accelerometer: ${gyroDelta} -> ${newGyroDelta}`);
      gyroDelta = newGyroDelta;
    } else {
      logger.debug('Gyro delta hasnt changed');
    }
  } else {
    logger.error('Wasnt able to update gyro delta: not a number.', typeof newGyroDelta, newGyroDelta);
  }

  if (!isNaN(newRotationDelta)) {
    if (newRotationDelta !== rotationDelta) {
      logger.info(`Updating rotation delta accelerometer: ${rotationDelta} -> ${newRotationDelta}`);
      rotationDelta = newRotationDelta;
    } else {
      logger.debug('Rotation delta hasnt changed');
    }
  } else {
    logger.error('Wasnt able to update rotation delta: not a number.', typeof newRotationDelta, newRotationDelta);
  }
}


module.exports = {
  init,
  onActiveAccelerometersChange,
};
