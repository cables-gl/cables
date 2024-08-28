const MIDIChannels = Array.from(Array(16).keys(), (i) => { return i + 1; });
const clamp = (val, min, max) => { return Math.min(Math.max(val, min), max); };
const PC_STATUS_BYTE = 0xc;

const inChannel = op.inDropDown("MIDI Channel", MIDIChannels, "1");
const inPCValue = op.inInt("Program Change Value", 0);
const inMin = op.inFloat("Min In Value", 0);
const inMax = op.inFloat("Max In Value", 1);

op.setPortGroup("General", [inChannel]);
op.setPortGroup("Program Change", [inPCValue]);
op.setPortGroup("Value Range", [inMin, inMax]);

const outEvent = op.outObject("MIDI Event Out");

inPCValue.onChange = function ()
{
    const val = inPCValue.get();

    const PCValue = Math.floor(CABLES.map(val, inMin.get(), inMax.get(), 0, 127));

    const event = {
        "deviceName": null,
        "output": null,
        "inputId": 0,
        "messageType": "Program Change",
        "data": [PC_STATUS_BYTE << 4 | (inChannel.get() - 1), PCValue],
        "value": PCValue,
        "channel": inChannel.get() - 1,
    };

    outEvent.set(null);
    outEvent.set(event);
};
