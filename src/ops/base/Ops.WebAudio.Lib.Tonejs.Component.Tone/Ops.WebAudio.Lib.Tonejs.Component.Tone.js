
// defaults
var NOTE_DEFAULT = "C";
var OCTAVE_DEFAULT = 4;
var OCTAVE_MIN = -1;
var OCTAVE_MAX = 10;

// constants
var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// inputs
var notePort = op.addInPort( new CABLES.Port( op, "Note", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: NOTES } ) );
notePort.set(NOTE_DEFAULT);
var octavePort = op.addInPort( new CABLES.Port( op, "Octave", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': OCTAVE_MIN, 'max': OCTAVE_MAX } ));
octavePort.set(OCTAVE_DEFAULT);

// output
var noteOutPort = op.outValue("Note String");

// change listeners
notePort.onChange = setOutPort;
octavePort.onChange = setOutPort;

// initialization
op.onLoaded = function() {
    setOutPort();
};

// functions
function setOutPort() {
    var octave = octavePort.get();
    octave = Math.round(octave);
    var octaveValid = octave >= OCTAVE_MIN && octave <= OCTAVE_MAX;
    var note = notePort.get();
    var noteValid = true; //TODO: Check
    
    //console.log("octave: ", octave, "typeof: ", typeof octave);
    
    if(octaveValid && noteValid) {
        try {
            var freq = Tone.Frequency(note + octave);
            noteOutPort.set(freq);
        } catch(e) {
            op.log(e); 
            setDefaultNote();
        }
    } else {
        setDefaultNote();
    }
}

function setDefaultNote() {
    noteOutPort.set(NOTE_DEFAULT + OCTAVE_DEFAULT);
    //notePort.set(NOTE_DEFAULT);
    //octavePort.set(OCTAVE_DEFAULT);
}

