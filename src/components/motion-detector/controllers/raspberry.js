const appRoot = require('app-root-path');
const logger = require(`${appRoot}/utils/logger`)('raspberry');
const i2c = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');
const { ACCELEROMETER } = require(`${appRoot}/config/configuration.json`);

const address = 0x70;
const i2c1 = i2c.openSync(1);

const sensor = new MPU6050(i2c1, address);

const data = sensor.readSync();
console.log('data', data);

module.exports = {
  listenAccelerometers: function(){},
};
