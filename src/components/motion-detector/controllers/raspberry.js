const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const Gpio = require('onoff').Gpio;
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

// Add here GPIO listeners
/**
 * @return {Promise}
 */
function listenAccelerometers() {
  const accelerometerPort = ACCELEROMETER.PORT;
  if (!accelerometerPort) {
    logger.error('No accelerometer port has been passed.');
    throw new Error('No accelerometer port has been passed.');
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
