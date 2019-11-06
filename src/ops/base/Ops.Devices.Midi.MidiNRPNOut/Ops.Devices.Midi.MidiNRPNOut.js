// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html
const MIDIChannels = Array.from(Array(16).keys(), i => i + 1);
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const CC_STATUS_BYTE = 0xb;
const CC_STATUS_BYTE_START = 176;

const inChannel = op.inDropDown("MIDI Channel", MIDIChannels, "1");
const inNrpnIndex = op.inInt("NRPN Index", 0);
const inNrpnValue = op.inInt("NRPN Value", 0);
const inMin = op.inFloat("Min In Value", 0);
const inMax = op.inFloat("Max In Value", 1);
op.setPortGroup("General",[inChannel]);
op.setPortGroup("NRPN",[inNrpnValue, inNrpnIndex]);
op.setPortGroup("Value Range",[inMin, inMax]);
const outEvent = op.outObject("MIDI Event Out");

inNrpnValue.onChange = function() {
    const val = inNrpnValue.get();

    const nrpnValue = Math.floor(CABLES.map(val,inMin.get(), inMax.get(), 0, 16383));
    const nrpnIndex = clamp(inNrpnIndex.get(), 0, 16383);
   // const ccValue = clamp(inNrpnValue.get(), 0, 127);
    /*
  const newEvent = Object.assign(
    {
      // OLD EVENT v
      deviceName,
      output: outputDevice,
      inputId: 0, // what is this for?
      messageType,
      // ...,
      index: outputIndex,
      value: outputValue,

      cmd: data[0] >> 4,
      channel: data[0] & 0xf,
      type: data[0] & 0xf0,
      note: data[1],
      velocity: data[2],
      data,
    },
    messageType === 'Note' && {
      newNote: [LSB, getMIDINote(LSB)],
      velocity: outputValue,
    },
    messageType === 'NRPN' && { nrpnIndex, nrpnValue },
  );
  */

  const event = {
      deviceName: null,
      output: null,
      inputId: 0,
      messageType: "NRPN",
      data: [],
      channel: inChannel.get() - 1,
      nrpnIndex,
      nrpnValue,
  }

  outEvent.set(null);
  outEvent.set(event);
}