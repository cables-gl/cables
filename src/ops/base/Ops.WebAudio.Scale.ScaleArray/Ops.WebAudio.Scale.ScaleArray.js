op.name="ScaleArray";

// constants
var BASE_TONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// scale types taken from: https://github.com/stagas/scales/blob/master/index.js
var SCALE_TYPES = {
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
var baseTonePort = this.addInPort( new Port( this, "Base Tone", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: BASE_TONES } ) );
baseTonePort.set("C");
var scaleTypePort = this.addInPort( new Port( this, "Scale Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: Object.keys(SCALE_TYPES) } ) );
scaleTypePort.set("Major");

// output
var scaleArrayPort = op.outArray("Scale Array");

// change listeners
baseTonePort.onChange = setOutput;
scaleTypePort.onChange = setOutput;

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
    var baseTone = baseTonePort.get();
    var baseToneIndex = getToneIndex(baseTone);
    var scaleType = scaleTypePort.get();
    if(SCALE_TYPES.hasOwnProperty(scaleType) && BASE_TONES.indexOf(baseTone) > -1) {
        var scale = SCALE_TYPES[scaleType];
        var scaleArray = [];
        for(var i=0; i<scale.length; i++) {
            scaleArray.push(getToneAt(scale[i], baseToneIndex));
        }
        scaleArrayPort.set(scaleArray);
    }
}

