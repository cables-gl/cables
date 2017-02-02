CABLES=CABLES||{};
CABLES.WebAudio = CABLES.WebAudio || {};

CABLES.WebAudio.createAudioContext = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(window.AudioContext) {
    if(!window.audioContext) {
      window.audioContext = new AudioContext();
    }
  } else {
    op.patch.config.onError('NO_WEBAUDIO','Web Audio is not supported in this browser.');
  }
};
