
// constants
var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var NOTE_DEFAULT = "C";
var APPEND_OCTAVE_DEFAULT = true;
var OCTAVE_DEFAULT = 3;
var OCTAVE_MIN = 0;
var OCTAVE_MAX = 7;

// input
var notePort = op.addInPort( new CABLES.Port( op, "Tone", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: NOTES } ) );
notePort.set(NOTE_DEFAULT);
var appendOctavePort = op.addInPort( new CABLES.Port( op, "Append Octave", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
appendOctavePort.set(APPEND_OCTAVE_DEFAULT);
var octavePort = op.addInPort( new CABLES.Port( op, "Octave", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': OCTAVE_MIN, 'max': OCTAVE_MAX } ));
octavePort.set(OCTAVE_DEFAULT);

// output
var noteOutPort = op.outValue("Note Out");

// change listeners
notePort.onChange = setOutput;
appendOctavePort.onChange = setOutput;
octavePort.onChange = setOutput;

// functions
function setOutput() {
    var note = notePort.get();
    if(NOTES.indexOf(note) > -1) {
        var appendOctave = appendOctavePort.get();
        var octave = octavePort.get();
        if(appendOctave && octave && octave >= OCTAVE_MIN && octave <= OCTAVE_MAX) { // "C4", "D4", ...
            octave = Math.round(octave);
            noteOutPort.set(note + octave);
        } else { // "C", "D", ...
            noteOutPort.set(note);    
        }
    }
}

// init
setOutput();