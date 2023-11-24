const outNumDevices = op.outNumber("Num Devices");
const outSupport = op.outValueBool("Midi Support");
const outNames = op.outArray("Device Names");

let midi = null;

function onMIDIFailure()
{
    outSupport.set(false);
}

if (navigator.requestMIDIAccess) navigator.requestMIDIAccess({ "sysex": false }).then(onMIDISuccess, onMIDIFailure);
else onMIDIFailure();

function onMIDISuccess(midiAccess)
{
    let arr = [];
    midi = midiAccess;
    outSupport.set(true);
    let inputs = midi.inputs.values();

    let devices = [];
    let numDevices = 0;

    for (let input = inputs.next(); input && !input.done; input = inputs.next())
    {
        arr.push(input.value.name);
        numDevices++;
    }

    outNames.set(arr);
    outNumDevices.set(numDevices);
}
