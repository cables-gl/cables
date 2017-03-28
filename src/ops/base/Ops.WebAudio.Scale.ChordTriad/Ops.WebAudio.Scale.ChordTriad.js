op.name="ChordTriad";

// vars
//var scaleIsDamaged = true;
var noteOctaveRegex = /([a-zA-Z#]+)([0-9]+)/;

// input
var scalePort = op.inArray("Scale");
var baseNotePort = op.inValueString("Base Note");

// functions
function scaleHasOctave(scale) {
    if(!scale) {
        op.log("Warning: ChordTriad needs a scale to work, check ScaleArray-op");
        scaleIsDamaged = true;
        return false;
    }
    for(var i=0; i<scale.length; i++) {
        if(!scale[i]) {
            return false;
        }
        var matches = scale[i].match(noteOctaveRegex);
        if(!matches || matches.length !== 3) {
            return false;
        }
    }
    return true;
}

// Extracts note (as string) and octave (as number) from a string
// e.g. "C5" -> ["C", 5]
function getNoteAndOctaveFromString(note) {
    if(!note) {
        op.log("Note seems to be corrupt");
        return;
    }
    var matches = note.match(noteOctaveRegex);
    if(matches && matches.length == 3) {
        try {
            return [matches[1], parseInt(matches[2])];
        } catch(e) {
            op.log("Note seems to be corrupt");
        }
    }
}

function appendOctave(scale) {
    var ret = scale.slice();
    for(var i=0; i<scale.length; i++) {
        var noteAndOctave = getNoteAndOctaveFromString(scale[i]);
        if(noteAndOctave) {
            ret.push(noteAndOctave[0] + (noteAndOctave[1]+1));    
        } else {
            return;
        }
    }
    return ret;
}

function findInArray(val, arr) {
    if(!arr || arr.length === 0) {
        return;
    }
    var note = val; // e.g. "C"
    var noteOctaveArr = getNoteAndOctaveFromString(val);
    if(noteOctaveArr) { // e.g. "C4"
        note = noteOctaveArr[0]; // "C"
    }    
    for(var i=0; i<arr.length; i++) {
        var noteOct = getNoteAndOctaveFromString(arr[i]);
        if(arr[i] === val || noteOct && noteOct[0] === note) {
            return i;
        }
    }
    return -1;
}

function getChord(scale, baseNote) {
    if(!scale || scale.length === 0 || !baseNote) {
        return;
    }
    if(scaleHasOctave(scale)) {
        scale = appendOctave(scale);
        var baseNoteI = findInArray(baseNote, scale);
        if(baseNoteI !== -1 && (baseNoteI+4) < scale.length) {
            return [scale[baseNoteI], scale[baseNoteI+2], scale[baseNoteI+4]];
        }
    }
}

// change listeners
baseNotePort.onChange = function() {
    var scale = scalePort.get();
    var baseNote = baseNotePort.get();
    var chord = getChord(scale, baseNote);
    if(chord) {
        chordPort.set(chord);
    }
};

// output
var chordPort = op.outArray("Chord");

