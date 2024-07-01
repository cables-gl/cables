// constants
let OCTAVE_DEFAULT = 4;

// vars
let noteOctaveRegex = /([a-zA-Z#]+)([0-9]+)/;

// input
let scalePort = op.inArray("Scale");
let baseNotePort = op.inValueString("Base Note");

// functions
function scaleHasOctave(scale)
{
    if (!scale)
    {
        op.log("Warning: ChordTriad needs a scale to work, check ScaleArray-op");
        scaleIsDamaged = true;
        return false;
    }
    for (let i = 0; i < scale.length; i++)
    {
        if (!scale[i])
        {
            return false;
        }
        let matches = scale[i].match(noteOctaveRegex);
        if (!matches || matches.length !== 3)
        {
            return false;
        }
    }
    return true;
}

// Extracts note (as string) and octave (as number) from a string
// e.g. "C5" -> ["C", 5]
function getNoteAndOctaveFromString(note)
{
    if (!note)
    {
        op.log("Note seems to be corrupt");
        return;
    }
    let matches = note.match(noteOctaveRegex);
    if (matches && matches.length == 3)
    {
        try
        {
            return [matches[1], parseInt(matches[2])];
        }
        catch (e)
        {
            op.log("Note seems to be corrupt");
        }
    }
}

function appendOctave(scale)
{
    let ret = scale.slice();
    for (let i = 0; i < scale.length; i++)
    {
        let noteAndOctave = getNoteAndOctaveFromString(scale[i]);
        if (noteAndOctave)
        {
            ret.push(noteAndOctave[0] + (noteAndOctave[1] + 1));
        }
        else
        {
            return;
        }
    }
    return ret;
}

function findInArray(val, arr)
{
    if (!arr || arr.length === 0)
    {
        return;
    }
    let note = val; // e.g. "C"
    let noteOctaveArr = getNoteAndOctaveFromString(val);
    if (noteOctaveArr)
    { // e.g. "C4"
        note = noteOctaveArr[0]; // "C"
    }
    for (let i = 0; i < arr.length; i++)
    {
        let noteOct = getNoteAndOctaveFromString(arr[i]);
        if (arr[i] === val || noteOct && noteOct[0] === note || arr[i] === note)
        {
            return i;
        }
    }
    return -1;
}

function getChord(scale, baseNote)
{
    if (!scale || scale.length === 0 || !baseNote)
    {
        return;
    }
    let scaleLength = scale.length;
    if (scaleHasOctave(scale))
    {
        scale = appendOctave(scale);
        let baseNoteI = findInArray(baseNote, scale);
        if (baseNoteI !== -1 && (baseNoteI + 4) < scale.length)
        {
            return [scale[baseNoteI], scale[baseNoteI + 2], scale[baseNoteI + 4]];
        }
    }
    else
    { // scale does not have octave, e.g. ["C", "D", "E", ...]
        let baseToneArr = getNoteAndOctaveFromString(baseNote);
        if (!baseToneArr)
        {
            return;
        }
        let baseoctave = baseToneArr[1];
        scale = scale.slice(); // append the scale
        let baseNoteI = findInArray(baseNote, scale);
        if (baseNoteI !== -1 && (baseNoteI + 4) < scale.length)
        {
            let ret = [
                scale[baseNoteI] + baseoctave,
                scale[baseNoteI + 2] + (baseNoteI + 2 < scaleLength ? baseoctave : baseoctave + 1),
                scale[baseNoteI + 4] + (baseNoteI + 4 < scaleLength ? baseoctave : baseoctave + 1),
            ];
            // return , scale[baseNoteI+2], ];
            return ret;
        }
    }
}

function setChordPort()
{
    let scale = scalePort.get();
    let baseNote = baseNotePort.get();
    let chord = getChord(scale, baseNote);
    if (chord)
    {
        chordPort.set(chord);
    }
}

// change listeners
baseNotePort.onChange = setChordPort;
scalePort.onChange = setChordPort;

// output
let chordPort = op.outArray("Chord");
