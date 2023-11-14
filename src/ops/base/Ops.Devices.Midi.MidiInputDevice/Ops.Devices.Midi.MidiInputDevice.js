
// http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/

// https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html

let normalize = op.addInPort(new CABLES.Port(op, "normalize", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let deviceSelect = op.addInPort(new CABLES.Port(op, "device", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["none"] }));

let resetLights = op.addInPort(new CABLES.Port(op, "Reset Lights", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

let outEvent = op.addOutPort(new CABLES.Port(op, "Event", CABLES.OP_PORT_TYPE_OBJECT));

resetLights.set(false);
normalize.set(true);

let midi = null;
let outputDevice = null;
let inputDevice = null;

deviceSelect.onChange = setDevice;

if (navigator.requestMIDIAccess) navigator.requestMIDIAccess({ "sysex": false }).then(onMIDISuccess, onMIDIFailure);
else onMIDIFailure();


resetLights.onChange = doResetLights;
function doResetLights()
{
    if (outputDevice && resetLights.get())
    {
        for (let i = 0; i < 128; i++)
        {
            outputDevice.send([0x90, i, 0]);
            outputDevice.send([0xb0, i, 0]);
        }
    }
}

function setDevice()
{
    if (!midi || !midi.inputs) return;
    let name = deviceSelect.get();

    op.setUiAttrib({ "extendTitle": name });

    let inputs = midi.inputs.values();
    let outputs = midi.outputs.values();

    for (let input = inputs.next(); input && !input.done; input = inputs.next())
    {
        if (input.value.name == name)
            input.value.onmidimessage = onMIDIMessage;
        else
        if (input.value.onmidimessage == onMIDIMessage)
            input.value.onmidimessage = null;
    }

    for (let output = outputs.next(); output && !output.done; output = outputs.next())
        if (output.value.name == name)
            outputDevice = midi.outputs.get(output.value.id);

    doResetLights();
}

function onMIDIFailure()
{
    op.uiAttr({ "warning": "No MIDI support in your browser." });
}

function onMIDISuccess(midiAccess)
{
    midi = midiAccess;
    let inputs = midi.inputs.values();
    op.uiAttr({ "info": "no midi devices found" });

    let deviceNames = [];

    for (let input = inputs.next(); input && !input.done; input = inputs.next())
        deviceNames.push(input.value.name);

    deviceSelect.uiAttribs.values = deviceNames;

    op.refreshParams();
    setDevice();
}

function onMIDIMessage(_event)
{
    let data = _event.data;
    let event =
        {
            "deviceName": deviceSelect.get(),
            "output": outputDevice,
            "inputId": 0,
            "cmd": data[0] >> 4,
            "channel": data[0] & 0xf,
            "type": data[0] & 0xf0,
            "note": data[1],
            "velocity": data[2],
            "data": data
        };

    if (normalize.get())event.velocity /= 127;

    // with pressure and tilt off
    // note off: 128, cmd: 8
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11:
    // bend: 224, cmd: 14

    outEvent.set(event);
}
