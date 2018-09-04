const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('miio');
const miio = require('miio');

let miioDevice = {
  power: false,
};

/**
 * @param {String} host
 * @param {String} token
 * @param {Boolean} reconnect
 */
function connect(host, token, reconnect = 0) {
  if (!reconnect) {
    logger.info(`Connecting to miio. Host:${host}; Token:${token}`);
  } else {
    logger.warn(`Reconnecting ${reconnect} to miio. Host:${host}; Token:${token}`);
  }
  if (!host) {
    logger.error('miio host not passed');
    return;
  }

  if (!token) {
    logger.error('miio token not passed, trying to connect without it');
  }
  miio.device({ address: host, token })
    .then((device) => {
      miioDevice.device = device;
      logger.info('Connected to', device);
    })
    .catch((err) => {
      logger.error('Wasnt able to connect to miio:', err);
      connect(host, token, ++reconnect);
    });
}
/**
 * @param  {Boolean} newPowerStatus
 */
function updatePowerSocket(newPowerStatus) {
  logger.debug('updatePowerSocket()', newPowerStatus);
  if (typeof newPowerStatus !== 'boolean') {
    logger.warn('Could not update power socket. Expected type: boolean, suplied:', typeof newPowerStatus);
    return;
  }
  if (!miioDevice.device) {
    logger.error('Could not update power: not connected to miio power socket');
    return;
  }

  if (miioDevice.power === newPowerStatus) {
    logger.debug('Not updating power status: power status hasnt changed');
    return;
  }

  logger.debug('updatePowerSocket()', 'setPower()', newPowerStatus);

  miioDevice.device.call('set_power', [newPowerStatus ? 'on' : 'off'])
    .then(() => {
      logger.debug('Updated power status to:', newPowerStatus);
      miioDevice.power = newPowerStatus;
    })
    .catch((err) => logger.error('Wasnt able to update power status:', err));
  // miioDevice.device.setPower(newPowerStatus)
}

module.exports = {
  connect,
  updatePowerSocket,
};
