function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

// constants
const NOTE_NUMBERS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

const BASE_TONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BASE_TONE_DEFAULT = "C";
const SCALE_TYPE_DEFAULT = "Minor";
const APPEND_OCTAVE_DEFAULT = true;
const OCTAVE_DEFAULT = 4;
const OCTAVE_MIN = -1;
const OCTAVE_MAX = 9;
const INCLUDE_HIGH_BASE_TONE_DEFAULT = false;

// scale types taken from: https://github.com/stagas/scales/blob/master/index.js
const SCALE_TYPES = {
    "Major": [0, 2, 4, 5, 7, 9, 11],
    "Minor": [0, 2, 3, 5, 7, 8, 10],
    "Ionian": [0, 2, 4, 5, 7, 9, 11],
    "Aeolian": [0, 2, 3, 5, 7, 8, 10],
    "Dorian": [0, 2, 3, 5, 7, 9, 10],
    "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
    "Lydian": [0, 2, 4, 6, 7, 9, 11],
    "Phrygian": [0, 1, 3, 5, 7, 8, 10],
    "Locrian": [0, 1, 3, 5, 6, 8, 10],
    "Diminished": [0, 1, 3, 4, 6, 7, 9, 10],
    "Whole Half": [0, 2, 3, 5, 6, 8, 9, 11],
    "Whole Tone": [0, 2, 4, 6, 8, 10],
    "Minor Blues": [0, 3, 5, 6, 7, 10],
    "Minor Pentatonic": [0, 3, 5, 7, 10],
    "Major Pentatonic": [0, 2, 4, 7, 9],
    "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
    "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
    "Super Locrian": [0, 1, 3, 4, 6, 8, 10],
    "Bhairav": [0, 1, 4, 5, 7, 8, 11],
    "Hungarian Minor": [0, 2, 3, 6, 7, 8, 11],
    "Minor Gypsy": [0, 1, 4, 5, 7, 8, 10],
    "Hirojoshi": [0, 2, 3, 7, 8],
    "In Sen": [0, 1, 5, 7, 10],
    "Iwato": [0, 1, 5, 6, 10],
    "Kumoi": [0, 2, 3, 7, 9],
    "Pelog": [0, 1, 3, 4, 7, 8],
    "Spanish": [0, 1, 3, 4, 5, 6, 8, 10],
    "Ion Aeol": [0, 2, 3, 4, 5, 7, 8, 9, 10, 11]
};

// input
const baseTonePort = op.inDropDown("Root Note", BASE_TONES, BASE_TONE_DEFAULT);
const scaleTypePort = op.inDropDown("Scale Type", Object.keys(SCALE_TYPES), SCALE_TYPE_DEFAULT);
const includeHighBaseTonePort = op.inBool("Include Upper Root Note", INCLUDE_HIGH_BASE_TONE_DEFAULT);
const octavePort = op.inInt("Octave", OCTAVE_DEFAULT);
const appendOctavePort = op.inBool("Append Octave To Names", APPEND_OCTAVE_DEFAULT);

op.setPortGroup("Scale Settings", [baseTonePort, scaleTypePort, includeHighBaseTonePort, octavePort, appendOctavePort]);

// output
const outNoteNames = op.outArray("Note Names Array");
const outNoteSteps = op.outArray("Note Step Number Array");
const outMidiNotes = op.outArray("Midi Note Array");
const outCurrentScale = op.outString("Current Scale");
// change listeners
baseTonePort.onChange = scaleTypePort.onChange = octavePort.onChange
= appendOctavePort.onChange = includeHighBaseTonePort.onChange = setOutput;

// functions
function getToneAt(index, offset)
{
    let i = index + offset;
    if (i >= BASE_TONES.length)
    {
        i -= BASE_TONES.length;
    }
    return BASE_TONES[i];
}

function getToneIndex(tone)
{
    for (let i = 0; i < BASE_TONES.length; i++)
    {
        if (BASE_TONES[i] === tone)
        {
            return i;
        }
    }
    return -1;
}

function setOutput()
{
    const baseTone = baseTonePort.get();
    const baseToneIndex = getToneIndex(baseTone);
    const scaleType = scaleTypePort.get();

    if (SCALE_TYPES.hasOwnProperty(scaleType) && BASE_TONES.indexOf(baseTone) > -1)
    {
        const scale = SCALE_TYPES[scaleType];
        const noteNamesArray = [];
        const noteStepsArray = [];
        const appendOctave = appendOctavePort.get();
        let octave = octavePort.get();

        if (octave > OCTAVE_MAX) op.setUiError("octave", "Octave value higher than " + OCTAVE_MAX + ". Setting to " + OCTAVE_MAX + ". Highest midi note is 127.", 1);
        else if (octave < OCTAVE_MIN) op.setUiError("octave", "Octave value lower than " + OCTAVE_MIN + ". Setting to " + OCTAVE_MIN + ". Lowest midi note is 0.", 1);
        else op.setUiError("octave", null);

        octave = clamp(Math.round(octave), OCTAVE_MIN, OCTAVE_MAX);

        for (let i = 0; i < scale.length; i++)
        {
            noteNamesArray.push(getToneAt(scale[i], baseToneIndex) + (appendOctave ? octave : ""));
            noteStepsArray.push(scale[i]);
        }

        // append the base tone in the next octave
        if (includeHighBaseTonePort.get())
        {
            noteStepsArray.push(scale[0] + 12);
            noteNamesArray.push(getToneAt(scale[0], baseToneIndex) + (appendOctave ? octave + 1 : ""));
        }

        const midiNotes = NOTE_NUMBERS
            .filter((nr) => noteStepsArray.includes(nr - 12)) // only get scale notes
            .map((nr) => nr + BASE_TONES.indexOf(baseTone) + 12 * octave) // map to midi note number
            .filter((midiNote) => midiNote <= 127); // only use values <= 127 (highest possible midi note)

        outNoteNames.set(null);
        outNoteNames.set(noteNamesArray);

        outNoteSteps.set(null);
        outNoteSteps.set(noteStepsArray);

        outMidiNotes.set(null);
        outMidiNotes.set(midiNotes);

        outCurrentScale.set(scaleTypePort.get());
    }
}

setOutput();
