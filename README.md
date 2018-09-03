## Environment options
- `SUPPRESSED_COMPONENTS`(default: '') - Elements that should not be started(e.g. "MOTION_DETECTOR,PLAYER") Used for debugging purposes.<br>
Possible values: <br>
  - `MOTION_DETECTOR` - will turn on only motion.
  - `PLAYBACK` - will turn on only playback component.
- `DEBUG_PLAYBACK`(default: false) - if turned on you'll be able to set state via std

## Configuration
You can set configuration in `config/configuration.json
- `LOG_LEVEL` - Logging level, for options see https://github.com/winstonjs/winston#logging 
  - `CONSOLE` - Console logging level
  - `FILE` - Console logging level (saved in logs/app.json)
- `DEFAULT_STATE` - Default state name
- `MIIO` - miio configuration
  - `HOST` - host to which miio should connect, e.g. "192.168.100.8"
  - `TOKEN` - connection token
- `ACCELEROMETER` - accelerometers config
    - `ACCELEROMETER_PORT` - Accelerometers port in hex format, e.g. "0x68"
    - `MUX_PORT` - MUX port in hex format, e.g. "0x70"
    - `CHANNELS` - Channels that are in use on mux possible value [0, 7];
    - `GYRO_DELTA`(Number) - (with live reload) Delta that is used to check whether accelerometer is active (`Math.abs(gyro[axis]> previousGyro[axis]) > GYRO_DELTA`)
    - `ROTATION_DELTA`(Number) - (with live reload) Delta that is used to check whether accelerometer is active (`Math.abs(rotation[axis] - previousRotation[axis]) > ROTATION_DELTA`)
- `FILE_PATHS`
  - `VIDEO_FILE`
  - `VIDEO_SOUND_FILE`
  - `SOUND_FILE`
- `STATES` - Object with state names/values. Each state should have unique key.<br>
Each state should contain such fields:
  ```
  {
    "ACTIVE_ACCELEROMETERS": Number,
    "VIDEO": {
      "VIDEO_START_TIME": Number,
      "VIDEO_END_TIME": Number,
      "AUDIO_START_TIME": Number,
      "AUDIO_END_TIME": Number
    },
    "SOUND": {
      "SHOUND_PLAY": Boolean,
      "SOUND_START_TIME": Number,
      "SOUND_END_TIME": Number
    },
    "WEB_SOCKET": {
      "SHOULD_WORK": Boolean
    }
  }
  ```
  *Note that first key with matched number of `ACTIVE_ACCELEROMETERS` will be activated.
 