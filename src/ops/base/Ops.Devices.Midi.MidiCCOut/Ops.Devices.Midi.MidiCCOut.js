const MIDIChannels = Array.from(Array(16).keys(), i => i + 1);
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const CC_STATUS_BYTE = 0xb;

const inChannel = op.inDropDown("MIDI Channel", MIDIChannels, "1");
const inCcIndex = op.inInt("CC Index", 1);
const inCCValue = op.inInt("CC Value", 0);
const inMin = op.inFloat("Min In Value", 0);
const inMax = op.inFloat("Max In Value", 1);

op.setPortGroup("General",[inChannel]);
op.setPortGroup("CC", [inCCValue, inCcIndex]);
op.setPortGroup("Value Range", [inMin,inMax]);

const outEvent = op.outObject("MIDI Event Out");

inCCValue.onChange = function() {
    const val = inCCValue.get();

    const ccValue = Math.floor(CABLES.map(val,inMin.get(), inMax.get(), 0, 127));
    const ccIndex = clamp(inCcIndex.get(), 1, 127);


  const event = {
      deviceName: null,
      output: null,
      inputId: 0,
      messageType: "CC",
      data: [CC_STATUS_BYTE << 4 | (inChannel.get() - 1), ccIndex, ccValue],
      index: ccIndex,
      value: ccValue,
      channel: inChannel.get() - 1,
  }

  outEvent.set(null);
  outEvent.set(event);
}