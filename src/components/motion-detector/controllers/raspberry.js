const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const Gpio = require('onoff').Gpio;

// Add here GPIO listeners
/**
 * @return {Promise}
 */
function listenAccelerometers() {
  const accelerometerPort = process.env.ACCELEROMETER_PORT;
  if (!accelerometerPort) {
    logger.error('No accelerometer port was passed');
    throw new Error('No accelerometer port was passed');
  }
  logger.info('Connecting to Acceleremeter on port:', accelerometerPort);
  const accelerometers = new Gpio(accelerometerPort, 'in', 'both');
  process.on('SIGINT', () => {
    accelerometers.unexport();
  });
  return accelerometers;
}

module.exports = {
  listenAccelerometers,
};
