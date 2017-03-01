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
    }
    // check if tone.js lib is being used
    if(window.Tone && !CABLES.WebAudio.toneJsInitialized) {
      // set current audio context in tone.js
      Tone.setContext(window.audioContext);
      CABLES.WebAudio.toneJsInitialized = true;
    }
  } else {
    op.patch.config.onError('NO_WEBAUDIO','Web Audio is not supported in this browser.');
  }
  return window.audioContext;
};

// Creates an audio in port for the op with name portName
// When disconnected it will disconnect the previous connected audio node
// from the op's audio node.
// @param op: required
// @param portName: required, The name of the port
// @param audioNode: required: The audionode incoming connections should connect to
// @param inputChannelIndex: optional, INT, if the audio node has multiple inputs,
//                           "1" would be the second input, default "0"
CABLES.WebAudio.createAudioInPort = function(op, portName, audioNode, inputChannelIndex) {
  if(!op || !portName || !audioNode) {
    op.log("ERROR: createAudioInPort needs three parameters, op, portName and audioNode");
    return;
  }
  if(!inputChannelIndex) {
    inputChannelIndex = 0;
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
                port.webAudio.previousAudioInNode.disconnect(audioNode, 0, inputChannelIndex);
            } catch(e) {
                console.log(e);
            }
        }
    } else {
      try{
        audioInNode.connect(audioNode, 0, inputChannelIndex);
      } catch(e) { op.log(e); }
    }
    port.webAudio.previousAudioInNode = audioInNode;
  };
  // TODO: Maybe add subtype to audio-node-object?
  return port;
};

CABLES.WebAudio.createAudioOutPort = function(op, portName, audioNode) {
  op.log("Audio out port created: ", audioNode);
  op.log("Audio out.connect: ", audioNode.connect);
  if(!op || !portName || !audioNode) {
    op.log("ERROR: createAudioOutPort needs three parameters, op, portName and audioNode");
    return;
  }

  var port = op.outObject(portName);
  // TODO: Maybe add subtype to audio-node-object?
  port.set(audioNode);
  return port;
};

// Creates an audio param in port for the op with name portName.
// The port accepts other audio nodes as signals as well as values (numbers)
// When the port is disconnected it will disconnect the previous connected audio node
// from the op's audio node and restore the number value set before.
// @param op: required
// @param portName: required, The name of the port
// @param audioNode: required: The audionode incoming connections should connect to
CABLES.WebAudio.createAudioParamInPort = function(op, portName, audioNode, options, defaultValue) {
  if(!op || !portName || !audioNode) {
    op.log("ERROR: createAudioInPort needs three parameters, op, portName and audioNode");
    if(!audioNode) {op.log("AudioNode is null!");}
    return;
  }
  op.webAudio = op.webAudio || {};
  op.webAudio.audioInPorts = op.webAudio.audioInPorts || [];
  //var port = op.inObject(portName);
  var port = op.inDynamic(portName, [OP_PORT_TYPE_VALUE, OP_PORT_TYPE_OBJECT], options, defaultValue);
  port.webAudio = {};
  port.webAudio.previousAudioInNode = null;

  op.webAudio.audioInPorts[portName] = port;

  // port.onLinkChanged = function() {
  //   op.log("onLinkChanged");
  //   if(port.isLinked()) {
  //
  //       if(port.links[0].portOut.type === OP_PORT_TYPE_VALUE) { // value
  //
  //       } else if(port.links[0].portOut.type === OP_PORT_TYPE_OBJECT) { // object
  //
  //       }
  //   } else { // unlinked
  //
  //   }
  // };

  port.onChange = function() {
    var audioInNode = port.get();

    if(port.webAudio.previousAudioInNode) op.log("previousAudioInNode: ", port.webAudio.previousAudioInNode);
    op.log("audioNode: ", audioNode);
    op.log("audioInNode: ", audioInNode);

    if (audioInNode != undefined) {
      if(typeof audioInNode === 'object') {
        try {
          audioInNode.connect(audioNode);
        } catch(e) {
          op.log(e);
        }
        port.webAudio.previousAudioInNode = audioInNode;
      } else {
        audioNode.value = audioInNode;
        if(port.webAudio.previousAudioInNode) {
          try{
              op.log("disconnecting node :");
              op.log("previousAudioInNode: ", port.webAudio.previousAudioInNode);
              op.log("audioNode: ", audioNode);
              port.webAudio.previousAudioInNode.disconnect(audioNode);
          } catch(e) {
              console.log(e);
          }
          port.webAudio.previousAudioInNode = undefined;
        }
      }
    } else {
      // disconnected
      if (port.webAudio.previousAudioInNode) {

      }
    }
    return port;
  };
};

CABLES.WebAudio.loadAudioFile = function(patch, url, onFinished, onError) {
  var audioContext = CABLES.WebAudio.createAudioContext();
  var loadingId = patch.loading.start('audio', url);
  if(CABLES.UI) gui.jobs().start({id: 'loadaudio' + loadingId, title:' loading audio (' + url + ')'});
  var request = new XMLHttpRequest();
  if(!url) { return; }
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  // TODO: maybe crossorigin stuff needed?
  // Decode asynchronously
  request.onload = function() {
    patch.loading.finished(loadingId);
    if(CABLES.UI) gui.jobs().finish('loadaudio' + loadingId);
    audioContext.decodeAudioData(request.response, onFinished, onError);
  }
  request.send();
};

CABLES.WebAudio.isValidToneTime = function(t) {
    try{
	    var time = new Tone.Time(t);
    } catch(e) {
    	return false;
    }
    return true;
};

CABLES.WebAudio.isValidToneNote = function(note) {
  try {
    Tone.Frequency(note);
  } catch(e) {
    return false;
  }
  return true;
};
