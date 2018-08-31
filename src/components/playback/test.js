const playback = require('./index.js');

setTimeout(() => {
  playback.updateState('STATE_1');
}, 3000);
