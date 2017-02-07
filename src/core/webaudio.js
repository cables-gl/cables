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
  return window.audioContext;
};

// Creates an audio in port for the op with name portName
// When disconnected it will disconnect the previous connected audio node
// from the op's audio node.
// Please Note: The op's audio node must be declared with "op.audioNode = ..."
CABLES.WebAudio.createAudioInPort = function(op, portName, audioNode) {
  if(!op || !portName || !audioNode) {
    op.log("ERROR: createAudioInPort needs three parameters, op, portName and audioNode");
    return;
  }
  op.webAudio = op.webAudio || {};
  op.webAudio.audioInPorts = op.webAudio.audioInPorts || [];
  var port = op.inObject(portName);
  port.webAudio = {};
  port.webAudio.previousAudioInNode = null;

  op.webAudio.audioInPorts[portName] = port;

  port.onChange = function() {
    var audioInNode = port.get();
    // when port disconnected, disconnect audio nodes
    if (!audioInNode) {
        if (port.webAudio.previousAudioInNode) {
            try{
                port.webAudio.previousAudioInNode.disconnect(audioNode);
            } catch(e) {
                console.log(e);
            }
        }
    } else {
        audioInNode.connect(audioNode);
    }
    port.webAudio.previousAudioInNode = audioInNode;
  };
  // TODO: Maybe add subtype to audio-node-object?
  return port;
};

CABLES.WebAudio.createAudioOutPort = function(op, portName, audioNode) {
  if(!op || !portName || !audioNode) {
    op.log("ERROR: createAudioOutPort needs three parameters, op, portName and audioNode");
    return;
  }

  var port = op.outObject(portName);
  // TODO: Maybe add subtype to audio-node-object?
  port.set(audioNode);
  return port;
};
