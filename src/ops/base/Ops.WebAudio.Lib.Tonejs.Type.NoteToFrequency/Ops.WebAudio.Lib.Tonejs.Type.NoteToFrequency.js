op.name="NoteToFrequency";

CABLES.WebAudio.createAudioContext(op);

// default values
var FREQ_DEFAULT = 0;

// inputs
var notePort = op.inValueString("Note");

// change listeners
notePort.onChange = function() {
    var note = notePort.get();
    op.log(CABLES.WebAudio.isValidToneNote(note));
    if(CABLES.WebAudio.isValidToneNote(note)) {
        var freqObj = new Tone.Frequency(note);    
        freqPort.set(freqObj.toFrequency());
    } else {
        freqPort.set(FREQ_DEFAULT);
    }
};

// outputs
var freqPort = op.outValue("Frequency");