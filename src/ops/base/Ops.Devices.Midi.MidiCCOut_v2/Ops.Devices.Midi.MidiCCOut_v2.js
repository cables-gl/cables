const MIDIChannels = Array.from(Array(16).keys(), (i) => { return i + 1; }),
    clamp = (val, min, max) => { return Math.min(Math.max(val, min), max); },
    CC_STATUS_BYTE = 0xb;

const inExec = op.inTriggerButton("Send"),
    inChannel = op.inDropDown("MIDI Channel", MIDIChannels, "1"),
    inCcIndex = op.inInt("CC Index", 1),
    inCCValue = op.inInt("CC Value", 0),
    inAuto = op.inBool("Auto send value change", false),
    outEvent = op.outObject("MIDI Event Out");

inExec.onTriggered = send;

inCCValue.onChange = () =>
{
    if (inAuto.get())send();
};

function send()
{
    const ccValue = clamp(inCCValue.get(), 0, 127);
    const ccIndex = clamp(inCcIndex.get(), 1, 127);

    const event = {
        "deviceName": null,
        "output": null,
        "inputId": 0,
        "messageType": "CC",
        "data": [CC_STATUS_BYTE << 4 | (inChannel.get() - 1), ccIndex, ccValue],
        "index": ccIndex,
        "value": ccValue,
        "channel": inChannel.get() - 1,
    };

    outEvent.setRef(event);
}
