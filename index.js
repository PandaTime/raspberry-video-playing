require('dotenv').config();
const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('components/index');
const configuration = require('./config/configuration.json');

/**
 * @return {Object}
*/
function getEnvConfiguration() {
  const env = process.env;
  logger.info('Passed env:', env);
  const envConfiguration = {
    activeComponents: {
      motionDetector: true,
      player: true,
    },
    debugPlayback: false,
  };
  const suppressedComponents = env.SUPPRESSED_COMPONENTS.split(',');
  suppressedComponents.forEach((component) => {
    if (envConfiguration.activeComponents.hasOwnProperty(component)) {
      envConfiguration.activeComponents[component] = false;
    }
  });

  if (env.DEBUG_PLAYBACK === 'true') {
    envConfiguration.debugPlayback = true;
  }
  return envConfiguration;
}

/** */
function init() {
  const envConfiguration = getEnvConfiguration();
  logger.info('Environment:', envConfiguration);
  logger.info('Configuration:', configuration);
  require('./src/index').init(envConfiguration);
}

init();
