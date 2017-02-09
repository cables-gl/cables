op.name="MidiValueToFrequency";

// input
var midiValuePort = op.inValue("MIDI Value");
var tuningPort = op.inValue("Tuning", 440);

// output
var frequencyPort = op.outValue("Frequency");

// change listeners
midiValuePort.onChange = setFrequency;
tuningPort.onChange = setFrequency;

// functions
function setFrequency() {
    var frequency = freq(tuningPort.get(), midiValuePort.get());
    frequencyPort.set(frequency);
}

// Taken from danigb - https://github.com/danigb/midi-freq
function freq (tuning, midi) {
  tuning = tuning || 440
  if (arguments.length > 1) return freq(tuning)(midi)

  return function (m) {
    return m === 0 || (m > 0 && m < 128) ? Math.pow(2, (m - 69) / 12) * tuning : null
  }
}