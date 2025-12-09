// defaults
let NOTE_DEFAULT = "C";
let OCTAVE_DEFAULT = 4;
let OCTAVE_MIN = -1;
let OCTAVE_MAX = 10;

// constants
let NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// inputs
let notePort = op.addInPort(new CABLES.Port(op, "Note", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": NOTES }));
notePort.set(NOTE_DEFAULT);
let octavePort = op.addInPort(new CABLES.Port(op, "Octave", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": OCTAVE_MIN, "max": OCTAVE_MAX }));
octavePort.set(OCTAVE_DEFAULT);

// output
let noteOutPort = op.outValue("Note String");

// change listeners
notePort.onChange = setOutPort;
octavePort.onChange = setOutPort;

// initialization
op.onLoaded = function ()
{
    setOutPort();
};

// functions
function setOutPort()
{
    let octave = octavePort.get();
    octave = Math.round(octave);
    let octaveValid = octave >= OCTAVE_MIN && octave <= OCTAVE_MAX;
    let note = notePort.get();
    let noteValid = true; // TODO: Check

    // console.log("octave: ", octave, "typeof: ", typeof octave);

    if (octaveValid && noteValid)
    {
        try
        {
            let freq = Tone.Frequency(note + octave);
            noteOutPort.set(freq);
        }
        catch (e)
        {
            op.log(e);
            setDefaultNote();
        }
    }
    else
    {
        setDefaultNote();
    }
}

function setDefaultNote()
{
    noteOutPort.set(NOTE_DEFAULT + OCTAVE_DEFAULT);
    // notePort.set(NOTE_DEFAULT);
    // octavePort.set(OCTAVE_DEFAULT);
}
