const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('miio');
const miio = require('miio');

let miioDevice = {};

/**
 */
function connect() {
  logger.info('Connecting to miio..');
  const host = process.env.MIIO_HOST;
  const token = process.env.MIIO_TOKEN;
  if (!host) {
    logger.error('miio host not passed');
    return;
  }
  if (!token) {
    logger.error('miio token not passed, trying to connect without it');
  }
  miio.device({ address: host, token })
    .then((device) => {
      setMiioDevice(device);
      logger.info('Connected to', device);
    })
    .catch((err) => {
      logger.error('Wasnt able to connect to miio:', err);
      throw err;
    });
}
/**
 * @param  {Boolean} newPowerStatus
 */
function updatePowerSocket(newPowerStatus) {
  if (!miioDevice.device) {
    logger.error('Could not update power: not connected to miio power socket');
    return;
  }

  if (miioDevice.power === newPowerStatus) {
    logger.debug('Not updating power status: power status hasnt changed');
    return;
  }

  miioDevice.device.setPower(newPowerStatus)
    .then(() => logger.debug('Updated power status to:', newPowerStatus))
    .catch((err) => logger.error('Wasnt able to update power status:', err));
}

/**
 * @param  {Miio<Device>} device
 */
function setMiioDevice(device) {
  miioDevice = {
    device,
    power: false,
  };
  device.on('power', (power) => {
    logger.debug('Power changed to:', power);
    miioDevice.power = power;
  });
}

connect();

module.exports = {
  updatePowerSocket,
};
