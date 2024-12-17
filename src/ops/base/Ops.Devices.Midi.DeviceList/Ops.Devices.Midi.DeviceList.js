const outNumDevices = op.outNumber("Num Devices");
const outSupport = op.outBoolNum("Midi Support");
const outNames = op.outArray("Device Names");

let midi = null;

function onMIDIFailure()
{
    outSupport.set(false);
}

function onMIDISuccess(midiAccess)
{
    if (midi) return;
    let arr = [];
    midi = midiAccess;
    outSupport.set(true);
    let inputs = midi.inputs.values();

    let numDevices = 0;
    for (let input = inputs.next(); input && !input.done; input = inputs.next())
    {
        arr.push(input.value.name);
        numDevices++;
    }

    outNames.setRef(arr);
    outNumDevices.set(numDevices);
}

function request()
{
    if (navigator.requestMIDIAccess) navigator.requestMIDIAccess({ "sysex": false }).then(onMIDISuccess, onMIDIFailure);
    else onMIDIFailure();

    if (!midi) setTimeout(request, 500);
}

request();
