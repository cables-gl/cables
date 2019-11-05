// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html
const CC_STATUS_BYTE = 0xb;
const NOTE_OFF = 0x8;

let midi = null;
let outputDevice = null;

const inDeviceSelect = op.inValueSelect('Device', ['none']);
const inNote = op.inObject("Note");
const inCC = op.inObject("CC");
const inNRPN = op.inObject("NRPN");

op.setPortGroup("Device",[inDeviceSelect]);
op.setPortGroup("Midi Events",[inNote, inCC, inNRPN]);


inNRPN.onChange = function(_event) {
    if (!outputDevice) return;
    if (!_event) return;

    const event = _event.get();

    if (!event) return;
    if (!event.data) return;
    if (event.messageType !== "NRPN") return;

    const indexLSB = (event.nrpnIndex & 0b1111111);
    const indexMSB = (event.nrpnIndex >> 7);

    const valueLSB = (event.nrpnValue & 0b1111111);
    const valueMSB = (event.nrpnValue >> 7);

    const dataIndexLSB = [CC_STATUS_BYTE << 4 | event.channel, 98, indexLSB];
    const dataIndexMSB = [CC_STATUS_BYTE << 4 | event.channel, 99, indexMSB];

    const dataValueLSB = [CC_STATUS_BYTE << 4 | event.channel, 38, valueLSB];
    const dataValueMSB = [CC_STATUS_BYTE << 4 | event.channel, 6, valueMSB];

    outputDevice.send(dataIndexLSB);
    outputDevice.send(dataIndexMSB);
    outputDevice.send(dataValueLSB);
    outputDevice.send(dataValueMSB);
}

inCC.onChange = function(_event) {
    if (!outputDevice) return;
    if (!_event) return;

    const event = _event.get();

    if (!event) return;
    if (!event.data) return;
    if (event.messageType !== "CC") return;
    // TODO: Check for invalid status bytes
    outputDevice.send(event.data);

}

var currentNote = null;
var currentChannel = null;

const killLastNote = () => {
  if (!outputDevice || !currentNote || !currentChannel) return;
    console.log("killLastNote outputdevice");
    console.log(outputDevice);
    outputDevice.send([(NOTE_OFF << 4 | (currentChannel)), currentNote, 0]);
};

const killAllNotes = () => {
    if (!outputDevice) return;
  for (let i = 0; i < 128; i += 1) {
    for (let channel = 0; channel < 16; channel += 1) outputDevice.send([(NOTE_OFF << 4 | channel), i, 0]);
    console.log("killAllNotes outputdevice");
  }
};

inNote.onLinkChanged = function() {
    if (!inNote.isLinked()) killAllNotes();
}

inNote.onChange = function(_event) {
    if (!outputDevice) return;
    if (!_event) return;

    const event = _event.get();

    if (!event) return;
    if (!event.data) return;
    // TODO: let CC all notes off message pass through
    //if (event.messageType !== "Note") return;
    // TODO: Check for invalid status bytes

    setTimeout(function() {
        outputDevice.send(event.data);
        currentNote = event.index;
        currentChannel = event.channel;
    }, 20);

}

function setDevice() {
  if (!midi || !midi.inputs) return;
  const name = inDeviceSelect.get();

  op.setTitle(`Midi ${name}`);

  const inputs = midi.inputs.values();
  const outputs = midi.outputs.values();

  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    if (output.value.name === name) {
      outputDevice = midi.outputs.get(output.value.id);
    }
  }
}


function onMIDIFailure() {
  op.uiAttr({ warning: 'No MIDI support in your browser.' });
}

function onMIDISuccess(midiAccess) {
  midi = midiAccess;
  const inputs = midi.inputs.values();
  const outputs = midi.outputs.values();
  op.uiAttr({ info: 'no midi devices found' });

  const deviceNames = [];

  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    deviceNames.push(output.value.name);
  }

  inDeviceSelect.uiAttribs.values = deviceNames;

  if (CABLES.UI) gui.patch().showOpParams(op);
  setDevice();
}

inDeviceSelect.onChange = setDevice;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
} else onMIDIFailure();















