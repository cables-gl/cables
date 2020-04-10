// http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/

// https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html

op.requirements = [CABLES.Requirements.MIDI];

/* INPUTS */

const deviceSelect = op.inValueSelect('Device', ['none']);

var learning = false;
const learn = op.inTriggerButton('Learn');
const resetIn = op.inTriggerButton('Panic');

op.setPortGroup('Device Select', [deviceSelect]);
op.setPortGroup('Controls', [learn, resetIn]);
/* OPS */
const opPrefix = 'Ops.Devices.Midi.Midi';
const OPS = {
  CC: { NAMESPACE: `${opPrefix}CC`, IN_PORT: 'CC Index' },
  NRPN: { NAMESPACE: `${opPrefix}NRPN`, IN_PORT: 'NRPN Index' },
  Note: { NAMESPACE: `${opPrefix}Note`, IN_PORT: 'Note' },
};
/* OUTPUTS */
const OUTPUT_KEYS = [
  'Event',
  'Note',
  'CC',

  // "Channel Pressure",
  // "Poly Key Pressure",
  'NRPN',
  // 'SysEx',
  // "Pitchbend",
  'Clock',
];

// unused midi signals
const NOT_YET_USED = ['Pitchbend', 'Channel Pressure', 'Poly Key Pressure', 'SysEx'];

// create outputs from keys specified above
const OUTPUTS = OUTPUT_KEYS.reduce((acc, cur) => {
  acc[cur] = op.outObject(cur);
  return acc;
}, {});

op.setPortGroup('MIDI Event', [OUTPUTS.Event]);
op.setPortGroup(
  'MIDI Event by Type',
  Object.keys(OUTPUTS).map(key => key !== 'Event' && OUTPUTS[key]).filter(Boolean),
);

/* CONSTANTS */
/* http://www.indiana.edu/~emusic/etext/MIDI/chapter3_MIDI3.shtml */
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/* MIDI STATUS BYTES */
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const POLY_KEY_PRESSURE = 0xa;
const CC = 0xb;
const PROGRAM_CHANGE = 0xc;
const CHANNEL_PRESSURE = 0xd;
const PITCH_BEND = 0xe;
const CLOCK = 0xf8;
const CLOCK_START = 0xfa;
const CLOCK_CONTINUE = 0xfb;
const CLOCK_STOP = 0xfc;
const CLOCK_SIGNALS = [CLOCK, CLOCK_START, CLOCK_CONTINUE, CLOCK_STOP];

const MESSAGE_TYPES = {
  [NOTE_OFF]: 'Note',
  [NOTE_ON]: 'Note',
  [POLY_KEY_PRESSURE]: 'Poly Key Pressure',
  [CC]: 'CC',
  [PROGRAM_CHANGE]: 'Program Change',
  [CHANNEL_PRESSURE]: 'Channel Pressure',
  [PITCH_BEND]: 'Pitchbend',
  [CLOCK]: 'Clock',
};

/* UTILITY FUNCTIONS */
function getMIDIChannel(statusByte) {
  return statusByte & 0x0f;
}
function getMessageType(statusByte) {
  return MESSAGE_TYPES[statusByte >> 4] || 'UNKNOWN';
}
function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}
const NRPN_CCS = [98, 99, 6, 38];
const NRPN_VALUE_MSB = 6;
const NRPN_VALUE_LSB = 38;
const NRPN_INDEX_MSB = 99;
const NRPN_INDEX_LSB = 98;

var nrpnIndexMSB = null;
var nrpnIndexLSB = null;
var nrpnValueMSB = null;
var nrpnValueLSB = null;

var nrpnIndex_ = null;
var nrpnValue_ = null;

/* NRPN implementations differ, we need to check whether the cycle starts with LSB or MSB */
const MSB_START = 9;
const LSB_START = 10;
var FIRST_CC = null;
var ROUTINE_TYPE = null;
/* the state of the current NRPN construction cycle */

/* eslint-disable */
var lastLSB = null;
var lastMSB = null;
/* eslint-enable */

const LSBRoutine = (ccIndex, ccValue) => {
  // NOTE: this is still the MSBRoutine
  if (ccIndex === NRPN_INDEX_MSB) nrpnIndexMSB = ccValue << 7;
  else if (ccIndex === NRPN_INDEX_LSB) nrpnIndexLSB = ccValue;

  nrpnIndex_ = nrpnIndexMSB | nrpnIndexLSB;

  if (typeof nrpnIndex_ === 'number') {
    if (ccIndex === NRPN_VALUE_MSB) {
      nrpnValueMSB = ccValue << 7;

      lastMSB = ccValue;
      if (typeof nrpnValueLSB === 'number') {
        nrpnValue_ = nrpnValueMSB | nrpnValueLSB;
        return [nrpnIndex_, nrpnValue_];
      }
    } else if (ccIndex === NRPN_VALUE_LSB) {
      nrpnValueLSB = ccValue;
      lastLSB = ccValue;
      nrpnValue_ = nrpnValueMSB | nrpnValueLSB;
      return [nrpnIndex_, nrpnValue_];
    }
  }

  return null;
};

const MSBRoutine = (ccIndex, ccValue) => {
  if (ccIndex === NRPN_INDEX_MSB) nrpnIndexMSB = ccValue << 7;
  else if (ccIndex === NRPN_INDEX_LSB) nrpnIndexLSB = ccValue;

  nrpnIndex_ = nrpnIndexMSB | nrpnIndexLSB;
  if (typeof nrpnIndex_ === 'number') {
    if (ccIndex === NRPN_VALUE_MSB) {
      nrpnValueMSB = ccValue << 7;

      if (typeof nrpnValueLSB === 'number') {
        nrpnValue_ = nrpnValueMSB | nrpnValueLSB;
        return [nrpnIndex_, nrpnValue_];
      }
    } else if (ccIndex === NRPN_VALUE_LSB) {
      nrpnValueLSB = ccValue;
      nrpnValue_ = nrpnValueMSB | nrpnValueLSB;
      return [nrpnIndex_, nrpnValue_];
    }
  }

  return null;
};

const NRPNRoutine = (ccIndex, ccValue) => {
  if (FIRST_CC === null) {
    FIRST_CC = ccIndex;
    ROUTINE_TYPE = FIRST_CC === NRPN_INDEX_MSB ? MSB_START : LSB_START;
  }
  if (ROUTINE_TYPE === MSB_START) {
    return MSBRoutine(ccIndex, ccValue);
  }
  if (ROUTINE_TYPE === LSB_START) {
    return LSBRoutine(ccIndex, ccValue);
  }
  return null;
};
var midi = null;

/* INIT FUNCTIONS */
var outputDevice = null;

function onMIDIMessage(_event) {
  if (!_event) return;

  const { data } = _event;
  const [statusByte, LSB, MSB] = data;

  if (CLOCK_SIGNALS.includes(statusByte)) {
    OUTPUTS.Clock.set(_event);
    return;
  }

  if (statusByte > 248) {
    // we don't use statusbytes above 248 for now
    return;
  }

  const deviceName = deviceSelect.get();
  const channel = getMIDIChannel(statusByte);

  let messageType = getMessageType(statusByte);
  const outputIndex = LSB;
  const outputValue = MSB;

  const isNRPNByte = messageType === 'CC' && NRPN_CCS.some(cc => cc === LSB);
  let nrpnIndex;
  let nrpnValue;

  if (isNRPNByte) {
    const nrpnValueRes = NRPNRoutine(LSB, MSB);
    if (nrpnValueRes) {
      const [index, value] = nrpnValueRes;
      messageType = 'NRPN';
      nrpnIndex = index;
      nrpnValue = value;
    }
  }

  const newEvent = Object.assign(
    {
      /* OLD EVENT v */
      deviceName,
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

  if (learning) {
    if (['Note', 'CC', 'NRPN'].includes(messageType)) {
      const newOp = op.patch.addOp(OPS[messageType].NAMESPACE, {
        translate: {
          x: op.uiAttribs.translate.x,
          y: op.uiAttribs.translate.y + 100,
        },
      });

      op.patch.link(op, messageType, newOp, 'MIDI Event In');
      newOp.getPortByName('MIDI Channel').set(channel + 1);

      if (messageType === 'Note') {
        const {
          newNote: [, noteName],
        } = newEvent;
        newOp.getPortByName('Note').set(noteName);
      }

      if (messageType === 'CC') {
        const { index } = newEvent;
        newOp.getPortByName('CC Index').set(index);
      }

      if (messageType === 'NRPN') {
        newOp.getPortByName('NRPN Index').set(nrpnIndex);
      }
    }
    learning = false;
  }
  // if (normalize.get()) event.velocity /= 127;

  // with pressure and tilt off
  // note off: 128, cmd: 8
  // note on: 144, cmd: 9
  // pressure / tilt on
  // pressure: 176, cmd 11:
  // bend: 224, cmd: 14
  OUTPUTS.Event.set(null);
  OUTPUTS.Event.set(newEvent);

  if (messageType !== 'UNKNOWN' && !NOT_YET_USED.includes(messageType)) {
    OUTPUTS[messageType].set(null);
    OUTPUTS[messageType].set(newEvent);
  }
}

function setDevice() {
  if (!midi || !midi.inputs) return;
  const name = deviceSelect.get();

  op.setTitle(`Midi ${name}`);

  const inputs = midi.inputs.values();
//  const outputs = midi.outputs.values();

  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    if (input.value.name === name) {
      input.value.onmidimessage = onMIDIMessage;
      outputDevice = midi.inputs.get(input.value.id);
    } else if (input.value.onmidimessage === onMIDIMessage) input.value.onmidimessage = null;
  }

  /* for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    if (output.value.name === name) {
      outputDevice = midi.outputs.get(output.value.id);
    }
  } */
}

function onMIDIFailure() {
  op.uiAttr({ warning: 'No MIDI support in your browser.' });
}

function onMIDISuccess(midiAccess) {
  midi = midiAccess;
  const inputs = midi.inputs.values();
  op.uiAttr({ info: 'no midi devices found' });

  const deviceNames = [];


  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    deviceNames.push(input.value.name);
  }

  deviceSelect.uiAttribs.values = deviceNames;

  if (CABLES.UI) gui.patch().showOpParams(op);
  setDevice();
}

deviceSelect.onChange = setDevice;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
} else onMIDIFailure();

resetIn.onTriggered = () => {

    // TODO: senmd note off to every note
    /*
  if (!outputDevice) return;
  for (let i = 0; i < 12; i += 1) {
    outputDevice.send([0x90, i, 0]);
    outputDevice.send([0xb0, i, 0]);
  } */
};

learn.onTriggered = () => {
  if (!outputDevice) return;
  learning = true;
};
