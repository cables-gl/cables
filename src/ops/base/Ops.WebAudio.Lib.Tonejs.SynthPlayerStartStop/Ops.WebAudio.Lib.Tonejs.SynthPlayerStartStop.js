op.name = "SynthPlayerStartStop";

CABLES.WebAudio.createAudioContext(op);

// default values
var DEFAULT_SYNTH = new Tone.Synth();
var DEFAULT_VELOCITY = 1;

// input ports
var synthPort = op.inObject("Synth");
var startPort = op.addInPort( new Port( this, "Start Play", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopPort = op.addInPort( new Port( this, "Stop Play", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var notePort = op.inValueString("Note", "C5");
var velocityPort = op.inValue("Velocity", DEFAULT_VELOCITY);
var timePort = op.inValueString("Time");

// output ports
var audioOutPort = op.outObject("Audio Out");

// vars
var synth;

// set default values
synth = DEFAULT_SYNTH;
audioOutPort.set(synth);

startPort.onTriggered = function() {
    var note = notePort.get();
    var velocity = velocityPort.get();
    var time = timePort.get();
    if(!velocity) velocity = DEFAULT_VELOCITY;
    if(time) {
        synth.triggerAttack (note, time, velocity);
    } else {
        synth.triggerAttack (note, velocity);
    }
    
};

stopPort.onTriggered = function() {
    var time = timePort.get();
    if(time) {
        synth.triggerRelease(time);    
    }
    else {
        synth.triggerRelease();
    }
};


// change listeners
synthPort.onChange = function() {
  var newSynth = synthPort.get();
  if(newSynth) {
    synth = newSynth;
    audioOutPort.set(synth);
  }
};

notePort.onChange = function() {
  var newNote = notePort.get();
  if(newNote) {
      var time = timePort.get();
      try {
        if(time) {
            synth.setNote(notePort.get(), time);  
        } else {
            synth.setNote(notePort.get());
        }
      } catch(e) {}
  }
};

timePort.onChange = function() {
  var val = timePort.get();
  if(!val) {
    //timePort.set(DEFAULT_TIME)
  }
};

velocityPort.onChange = function() {
  var val = velocityPort.get();
  if(!val) {
    //velocityPort.set(DEFAULT_VELOCITY)
  }
};
