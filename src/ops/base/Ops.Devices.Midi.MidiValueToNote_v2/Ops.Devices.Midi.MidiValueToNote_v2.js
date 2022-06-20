let midiValuePort = op.inValue("Midi Value");
let notePort = op.outString("Note");

let FLATS = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
let SHARPS = "C C# D D# E F F# G G# A A# B".split(" ");

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
