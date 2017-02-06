CABLES=CABLES||{};
CABLES.WebAudio = CABLES.WebAudio || {};

// Checks if a global audio context has been created and creates
// it if necessary.
// Also associates the audio context with tone.js if it is being used
CABLES.WebAudio.createAudioContext = function(op) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(window.AudioContext) {
    if(!window.audioContext) {
      window.audioContext = new AudioContext();
      // check if tone.js lib is being used
      if(window.Tone && !CABLES.WebAudio.toneJsInitialized) {
        // set current audio context in tone.js
        Tone.setContext(window.audioContext);
        CABLES.WebAudio.toneJsInitialized = true;
      }
    }
  } else {
    op.patch.config.onError('NO_WEBAUDIO','Web Audio is not supported in this browser.');
  }
};
