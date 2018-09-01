const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const i2c = require('i2c-bus');
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

const DS1621_ADDR = ACCELEROMETER.PORT; //0x48; // hex?!
const CMD_ACCESS_CONFIG = 0xac;
const CMD_READ_TEMP = 0xaa;
const CMD_START_CONVERT = 0xee;

// Add here GPIO listeners
/**
 * @return {Promise}
 */
function listenAccelerometers() {
  // const accelerometerPort = ACCELEROMETER.PORT;
  // if (isNaN(accelerometerPort)) {
  //   logger.error('No accelerometer port has been passed.');
  //   throw new Error('No accelerometer port has been passed.');
  // }
  // logger.info('Connecting to Acceleremeter on port:', accelerometerPort);
  // const accelerometers = new i2c(accelerometerPort, 'in', 'both');
  // process.on('SIGINT', () => {
  //   accelerometers.unexport();
  // });
  // return accelerometers;
  const i2c1 = i2c.openSync(1);

  // Enter one shot mode (this is a non volatile setting)
  i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }

  // Start temperature conversion
  i2c1.sendByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for temperature conversion to complete
  while ((i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
  }

  // Display temperature
  const rawTemp = i2c1.readWordSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + rawTemp);

  i2c1.closeSync();
}

module.exports = {
  listenAccelerometers,
};
