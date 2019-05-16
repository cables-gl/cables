
/**
 * Converts a frequency to a note
 * If the note is undefined (too low, e.g. 0) it will use the 
 * lowest possible note instead
 */

CABLES.WEBAUDIO.createAudioContext(op);

// default values
var FREQ_DEFAULT = 0;
var LOWEST_NOTE = "C-4";

// inputs
var frequencyPort = op.inValue("Frequency");

// change listeners
frequencyPort.onChange = function() {
    var frequency = frequencyPort.get();
    if(frequency == 0) {
        notePort.set(LOWEST_NOTE);
        return;
    }
    op.log(CABLES.WEBAUDIO.isValidToneNote(frequency));
    if(CABLES.WEBAUDIO.isValidToneNote(frequency)) {
        var freqObj = new Tone.Frequency(frequency);    
        notePort.set(freqObj.toNote());
    } else {
        notePort.set(LOWEST_NOTE);
    }
};

// outputs
var notePort = op.outValue("Note");