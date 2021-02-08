
// constants
const BASE_TONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BASE_TONE_DEFAULT = "C";
const SCALE_TYPE_DEFAULT = "Minor";
const APPEND_OCTAVE_DEFAULT = true;
const OCTAVE_DEFAULT = 3;
const OCTAVE_MIN = 0;
const OCTAVE_MAX = 7;
const INCLUDE_HIGH_BASE_TONE_DEFAULT = false;

// scale types taken from: https://github.com/stagas/scales/blob/master/index.js
const SCALE_TYPES = {
	'Major': [0, 2, 4, 5, 7, 9, 11],
	'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Ionian': [0, 2, 4, 5, 7, 9, 11],
	'Aeolian': [0, 2, 3, 5, 7, 8, 10],
	'Dorian': [0, 2, 3, 5, 7, 9, 10],
	'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
	'Lydian': [0, 2, 4, 6, 7, 9, 11],
	'Phrygian': [0, 1, 3, 5, 7, 8, 10],
	'Locrian': [0, 1, 3, 5, 6, 8, 10],
	'Diminished': [0, 1, 3, 4, 6, 7, 9, 10],
	'Whole Half': [0, 2, 3, 5, 6, 8, 9, 11],
	'Whole Tone': [0, 2, 4, 6, 8, 10],
	'Minor Blues': [0, 3, 5, 6, 7, 10],
	'Minor Pentatonic': [0, 3, 5, 7, 10],
	'Major Pentatonic': [0, 2, 4, 7, 9],
	'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
	'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
	'Super Locrian': [0, 1, 3, 4, 6, 8, 10],
	'Bhairav': [0, 1, 4, 5, 7, 8, 11],
	'Hungarian Minor': [0, 2, 3, 6, 7, 8, 11],
	'Minor Gypsy': [0, 1, 4, 5, 7, 8, 10],
	'Hirojoshi': [0, 2, 3, 7, 8],
	'In Sen': [0, 1, 5, 7, 10],
	'Iwato': [0, 1, 5, 6, 10],
	'Kumoi': [0, 2, 3, 7, 9],
	'Pelog': [0, 1, 3, 4, 7, 8],
	'Spanish': [0, 1, 3, 4, 5, 6, 8, 10],
	'Ion Aeol': [0, 2, 3, 4, 5, 7, 8, 9, 10, 11]
};

// input
const baseTonePort = op.inDropDown("Base Tone", BASE_TONES, BASE_TONE_DEFAULT);
const scaleTypePort = op.inDropDown("Scale Type", Object.keys(SCALE_TYPES), SCALE_TYPE_DEFAULT);
var octavePort = op.inInt("Octave", OCTAVE_DEFAULT);

const appendOctavePort = op.inBool("Append Octave", APPEND_OCTAVE_DEFAULT);

const includeHighBaseTonePort = op.inBool("Include High Base Tone", INCLUDE_HIGH_BASE_TONE_DEFAULT);

// output
const scaleArrayPort = op.outArray("Scale Array");
const stepArrayPort = op.outArray("Note Step Number Array");
// change listeners
baseTonePort.onChange = scaleTypePort.onChange = octavePort.onChange
= appendOctavePort.onChange = includeHighBaseTonePort.onChange = setOutput;

// functions
function getToneAt(index, offset) {
    var i = index + offset;
    if(i>=BASE_TONES.length) {
        i -= BASE_TONES.length;
    }
    return BASE_TONES[i];
}

function getToneIndex(tone) {
    for(var i=0; i<BASE_TONES.length; i++) {
        if(BASE_TONES[i] === tone) {
            return i;
        }
    }
    return -1;
}

function setOutput() {
    const baseTone = baseTonePort.get();
    const baseToneIndex = getToneIndex(baseTone);
    const scaleType = scaleTypePort.get();

   if(SCALE_TYPES.hasOwnProperty(scaleType) && BASE_TONES.indexOf(baseTone) > -1) {
        const scale = SCALE_TYPES[scaleType];
        const scaleArray = [];
        const stepArray = [];
        const appendOctave = appendOctavePort.get();
        let octave = octavePort.get();

        if(appendOctave && octave && octave >= OCTAVE_MIN && octave <= OCTAVE_MAX) { // "C4", "D4", ...
            octave = Math.round(octave);

            for(var i=0; i<scale.length; i++) {
                scaleArray.push(getToneAt(scale[i], baseToneIndex) + octave);
                stepArray.push(scale[i]);

            }
            // append the base tone in the next octave
            if(includeHighBaseTonePort.get()) {
                scaleArray.push(getToneAt(scale[0], baseToneIndex) + (octave+1));
                stepArray.push(scale[0] + 12);
            }
        } else { // "C", "D", ...
            for(var j=0; j<scale.length; j++) {
                scaleArray.push(getToneAt(scale[j], baseToneIndex));
                stepArray.push(scale[j]);
            }
        }
        scaleArrayPort.set(null);
        scaleArrayPort.set(scaleArray);

        stepArrayPort.set(null);
        stepArrayPort.set(stepArray);

    }
}

setOutput();
