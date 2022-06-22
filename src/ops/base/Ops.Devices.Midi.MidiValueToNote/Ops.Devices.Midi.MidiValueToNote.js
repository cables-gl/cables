let midiValuePort = op.inValue("Midi Value");
let notePort = op.outValue("Note");

let FLATS = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
let SHARPS = "C C# D D# E F F# G G# A A# B".split(" ");

/**
 * MIT License, https://github.com/danigb/tonal
 * Given a midi number, returns a note name. The altered notes will have
 * flats unless explicitly set with the optional `useSharps` parameter.
 *
 * @function
 * @param {Integer} midi - the midi note number
 * @param {Boolean} useSharps - (Optional) set to true to use sharps instead of flats
 * @return {String} the note name
 * @example
 * var midi = require('tonal-midi')
 * midi.note(61) // => 'Db4'
 * midi.note(61, true) // => 'C#4'
 * // it rounds to nearest note
 * midi.note(61.7) // => 'D4'
 */
function note(num, sharps)
{
    if (num === true || num === false) return function (m) { return note(m, num); };
    num = Math.round(num);
    let pcs = sharps === true ? SHARPS : FLATS;
    let pc = pcs[num % 12];
    let o = Math.floor(num / 12) - 1;
    return pc + o;
}

midiValuePort.onChange = function ()
{
    let val = midiValuePort.get();
    if (val)
    {
        let n = note(val, true);
        notePort.set(n);
    }
};
