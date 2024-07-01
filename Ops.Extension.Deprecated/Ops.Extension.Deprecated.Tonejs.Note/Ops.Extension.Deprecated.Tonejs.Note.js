// constants
let NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let NOTE_DEFAULT = "C";
let APPEND_OCTAVE_DEFAULT = true;
let OCTAVE_DEFAULT = 3;
let OCTAVE_MIN = 0;
let OCTAVE_MAX = 7;

// input
let notePort = op.addInPort(new CABLES.Port(op, "Tone", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": NOTES }));
notePort.set(NOTE_DEFAULT);
let appendOctavePort = op.addInPort(new CABLES.Port(op, "Append Octave", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
appendOctavePort.set(APPEND_OCTAVE_DEFAULT);
let octavePort = op.addInPort(new CABLES.Port(op, "Octave", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": OCTAVE_MIN, "max": OCTAVE_MAX }));
octavePort.set(OCTAVE_DEFAULT);

// output
let noteOutPort = op.outValue("Note Out");

// change listeners
notePort.onChange = setOutput;
appendOctavePort.onChange = setOutput;
octavePort.onChange = setOutput;

// functions
function setOutput()
{
    let note = notePort.get();
    if (NOTES.indexOf(note) > -1)
    {
        let appendOctave = appendOctavePort.get();
        let octave = octavePort.get();
        if (appendOctave && octave && octave >= OCTAVE_MIN && octave <= OCTAVE_MAX)
        { // "C4", "D4", ...
            octave = Math.round(octave);
            noteOutPort.set(note + octave);
        }
        else
        { // "C", "D", ...
            noteOutPort.set(note);
        }
    }
}

// init
setOutput();
