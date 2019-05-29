/* OUTPUTS */
const OUTPUT_KEYS = [
  'MIDI Channel',
  'Message Type',
  'Note Value',
  'Velocity',
  'CC Number',
  'CC Value',
  'Pitch Bend Value',
  'NRPN Number',
  'NRPN Value',
];
const eventOut = op.outObject('MIDI Event Out');
// create outputs from keys specified above
const OUTPUTS = OUTPUT_KEYS.reduce((acc, cur) => {
  acc[cur] = op.outValue(cur, '-');
  return acc;
}, {});

/* http://midiio.sapp.org/src/MidiOutput.cpp for NRPN */
/* http://www.indiana.edu/~emusic/etext/MIDI/chapter3_MIDI3.shtml */
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/*
The two things we can assume is that we will receive the NRPN index messages BEFORE the data
and that the LSB of the data will change every time we get an NRPN change.
*/

function getMIDIChannel(statusByte) {
  return (statusByte & 0x0f) + 1;
}

function getMessageValue(dataByte2MSB) {
  return dataByte2MSB;
}
function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}
function getCCNumber(dataByte1LSB) {
  return dataByte1LSB;
}
function getPitchBendValue(dataByte1LSB, dataByte2MSB) {
  const pitchBendValue = (dataByte2MSB << 7) + dataByte1LSB - 8192; //  scale to -1 to 1 = /8192;
  return pitchBendValue;
}

/* http://tetradev.blogspot.com/2010/03/nrpns-part-2-nrpns-in-ableton-with-max.html */
/* https://sites.uci.edu/camp2014/2014/04/30/managing-midi-pitchbend-messages/ */

const inData = op.inObject('Event');

inData.onChange = () => {
  const event = inData.get();

  if (!event || !event.data) return;
  const [statusByte, dataByte1LSB, dataByte2MSB] = event.data;
  /* We skip MIDI signals that at the moment are not relevant for CABLES,
       i.e. Ableton: if SYNC is on, every 2nd 3-Byte-Tuple sent
       is a Timing clock message
       we don't wanna show that for now, hence we skip everything above 248 */
  if (statusByte >= 248) {
    eventOut.set(event);
    return;
  }

  const { messageType } = event;

  const isNoteMessage = messageType === 'NOTE ON' || messageType === 'NOTE OFF';
  const isCCMessage = messageType === 'CC';
  const isPitchBendMessage = messageType === 'PITCH BEND';

  OUTPUTS['MIDI Channel'].set(getMIDIChannel(statusByte));
  OUTPUTS['Message Type'].set(messageType);

  OUTPUTS['Note Value'].set(isNoteMessage ? getMIDINote(dataByte1LSB) : '-');
  OUTPUTS.Velocity.set(isNoteMessage ? getMessageValue(dataByte2MSB) : '-');

  if (messageType !== 'NRPN') {
    OUTPUTS['CC Number'].set(isCCMessage ? getCCNumber(dataByte1LSB) : '-');
    OUTPUTS['CC Value'].set(isCCMessage ? getMessageValue(dataByte2MSB) : '-');
  } else {
    OUTPUTS['CC Number'].set('-');
    OUTPUTS['CC Value'].set('-');
  }

  if (messageType === 'NRPN') {
    OUTPUTS['NRPN Number'].set(event.nrpnIndex);
    OUTPUTS['NRPN Value'].set(event.nrpnValue);
  }
  OUTPUTS['Pitch Bend Value'].set(
    isPitchBendMessage ? getPitchBendValue(dataByte1LSB, dataByte2MSB) : '-',
  );
  eventOut.set(event);
  // }
};
