const
    inObj = op.inObject("MidiJson"),
    inTime = op.inValue("Time"),
    outBeat = op.outNumber("Beat"),
    outTrackNames = op.outArray("Track Names"),
    outNames = op.outArray("Names"),
    outProgress = op.outArray("Progress"),
    outVelocity = op.outArray("Velocity"),
    outNumTracks = op.outNumber("Num Tracks"),
    outBPM = op.outNumber("BPM"),
    outData = op.outObject("Data");

let midi = null;
let arrNames = [];
let arrProgress = [];
let arrVelocity = [];
let bpm = 0;

inObj.onChange = function ()
{
    midi = null;
    outNumTracks.set(0);

    midi = inObj.get();
    if (!midi) return;
    if (!midi.tracks) return;

    outNumTracks.set(midi.tracks.length);

    let arrTrackNames = [];
    for (let i = 0; i < midi.tracks.length; i++)
    {
        arrTrackNames[i] = midi.tracks[i].name || "?";
    }

    outTrackNames.set(null);
    outTrackNames.set(arrTrackNames);

    arrNames.length = midi.tracks.length;

    bpm = midi.header.bpm;
    outBPM.set(midi.header.bpm);

    for (let t = 0; t < midi.tracks.length; t++)
    {
        for (let n = 0; n < midi.tracks[t].notes.length; n++)
        {
            let note = midi.tracks[t].notes[n];
            note.timeEnd = note.time + note.duration;
        }
    }
};

inTime.onChange = function ()
{
    if (!midi) return;
    if (!midi.tracks) return;

    let time = inTime.get();
    let beat = Math.round(inTime.get() / 60 * (bpm));

    for (let t = 0; t < midi.tracks.length; t++)
    {
        arrNames[t] = "";
        arrProgress[t] = 0;
        arrVelocity[t] = 0;

        for (let n = 0; n < midi.tracks[t].notes.length; n++)
        {
            let note = midi.tracks[t].notes[n];

            if (
                time > note.time &&
                time < note.timeEnd)
            {
                arrProgress[t] = (time - note.time) / (note.duration);
                arrNames[t] = note.name;
                arrVelocity[t] = note.velocity;

                const data =
                {
                    "beat": 0,
                    "names": arrNames,
                    "progress": arrProgress,
                    "velocity": arrVelocity,
                    "midi": note.midi,
                    "beat": beat

                };

                outData.setRef(data);
            }
        }
    }

    outNames.setRef(arrNames);
    outNames.setUiAttribs({ "stride": arrNames.length });
    outProgress.setRef(arrProgress);
    outVelocity.setRef(arrVelocity);

    outBeat.set(beat);
};
