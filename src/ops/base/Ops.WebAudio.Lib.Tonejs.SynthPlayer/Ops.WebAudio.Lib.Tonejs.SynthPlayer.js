op.name = "SynthPlayerFixedLength";

CABLES.WebAudio.createAudioContext(op);

// input ports
var synthPort = op.inObject("Synth");
var playTonePort = op.addInPort( new Port( this, "Play Tone", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var notePort = op.inValueString("Note");
var velocityPort = op.inObject("Velocity");
var durationPort = op.inValueString("Duration");
var timePort = op.inValueString("Time");

// output ports
var audioOutPort = op.outObject("Audio Out");

// vars
var synth;

// default values
var DEFAULT_SYNTH = new Tone.Synth().toMaster();
var DEFAULT_NOTE = "C4";
var DEFAULT_VELOCITY = 1;
var DEFAULT_DURATION = "4n";
var DEFAULT_TIME = "C4";

// set default values
synth = DEFAULT_SYNTH;
notePort.set("C4");
velocityPort.set(1);
durationPort.set("4n");
timePort.set("+0");
audioOutPort.set(synth);

// trigger listeners
// playTonePort.onTriggered = function() {
//   op.log("Triggering sound....");
//   op.log("notePort.get(): ", notePort.get());
//   op.log("durationPort.get(): ", durationPort.get());
//   op.log("timePort.get(): ", timePort.get());
//   op.log("velocityPort.get(): ", velocityPort.get());
//   synth.triggerAttackRelease (
//     notePort.get() || DEFAULT_NOTE,
//     durationPort.get() || DEFAULT_DURATION,
//     timePort.get() || DEFAULT_TIME,
//     velocityPort.get() || DEFAULT_VELOCITY
//   );
// };

playTonePort.onTriggered = function() {
  op.log("Triggering sound....");
  op.log("notePort.get(): ", notePort.get());
  op.log("durationPort.get(): ", durationPort.get());
  op.log("timePort.get(): ", timePort.get());
  op.log("velocityPort.get(): ", velocityPort.get());
  synth.triggerAttackRelease (
    notePort.get(),
    durationPort.get(),
    timePort.get(),
    velocityPort.get()
  );
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
    synth.setNote();
  }
};

durationPort.onChange = function() {
  var val = durationPort.get();
  if(!val) {
    durationPort.set(DEFAULT_DURATION);
  }
};

timePort.onChange = function() {
  var val = timePort.get();
  if(!val) {
    timePort.set(DEFAULT_TIME);
  }
};

velocityPort.onChange = function() {
  var val = velocityPort.get();
  if(!val) {
    velocityPort.set(DEFAULT_VELOCITY);
  }
};
