op.name="NoteToFrequency";

CABLES.WebAudio.createAudioContext(op);

// default values
var FREQ_DEFAULT = 0;

// inputs
var notePort = op.inValueString("Note");

// change listeners
notePort.onChange = function() {
    var note = notePort.get();
    if(CABLES.WebAudio.isValidToneNote(note)) {
        var freqObj = new Tone.Frequency(note);    
        freqPort.set(freqObj.eval());
    } else {
        freqPort.set(FREQ_DEFAULT);
    }
};

// outputs
var freqPort = op.outValue("Frequency");