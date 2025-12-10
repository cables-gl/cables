CABLES.WEBAUDIO.createAudioContext(op);

// default values
let FREQ_DEFAULT = 0;

// inputs
let notePort = op.inValueString("Note");

// change listeners
notePort.onChange = function ()
{
    let note = notePort.get();
    op.log(CABLES.WEBAUDIO.isValidToneNote(note));
    if (CABLES.WEBAUDIO.isValidToneNote(note))
    {
        let freqObj = new Tone.Frequency(note);
        freqPort.set(freqObj.toFrequency());
    }
    else
    {
        freqPort.set(FREQ_DEFAULT);
    }
};

// outputs
var freqPort = op.outValue("Frequency");
