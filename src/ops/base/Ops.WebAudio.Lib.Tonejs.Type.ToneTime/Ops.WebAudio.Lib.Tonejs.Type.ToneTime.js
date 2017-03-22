op.name = "ToneTime";

// see https://github.com/Tonejs/Tone.js/wiki/Time

// constants
var DEFAULT_TIME_SUFFIX = "n";
var TIME_SUFFIXES = {};
TIME_SUFFIXES["Note"] = "n";
TIME_SUFFIXES["Triplet"] = "t";
TIME_SUFFIXES["Measure"] = "m";
TIME_SUFFIXES["Second"] = "";
TIME_SUFFIXES["Frequency"] = "hz";
TIME_SUFFIXES["Tick"] = "i";
var TIME_SUFFIX_KEYS = Object.keys(TIME_SUFFIXES);

// input ports
var timeInputPort = op.inValue("Time");
var timeTypePort = this.addInPort(
  new Port( this, "Time Type", OP_PORT_TYPE_VALUE,
    { display: 'dropdown', values: TIME_SUFFIX_KEYS }
  )
);
var nowRelativePort = op.addInPort(
  new Port( this, "Relative To Now", OP_PORT_TYPE_VALUE, { display: 'bool' } )
);

// output port
var toneTimePort = op.outValue("Tone Time");

// vars
var currentTimeSuffix = DEFAULT_TIME_SUFFIX;
var prefix = ""; // either "+" or "", used for now-relative-time

var getTimeSuffix = function(key) {
  if(key && key in TIME_SUFFIXES) {
    return TIME_SUFFIXES[key];
  }
  return DEFAULT_TIME_SUFFIX;
};

timeTypePort.onChange = function() {
  currentTimeSuffix = getTimeSuffix(timeTypePort.get());
  setToneTimePort();
};

timeInputPort.onChange = setToneTimePort;

function setToneTimePort() {
  if(timeInputPort.get()) {
    toneTimePort.set(prefix + timeInputPort.get() + currentTimeSuffix);
  } else {
    toneTimePort.set("");
  }
};

nowRelativePort.onChange = function() {
    prefix = nowRelativePort.get() ? "+" : "";
    setToneTimePort();
};

// set defaults
timeTypePort.set(DEFAULT_TIME_SUFFIX);
nowRelativePort.set(false);
