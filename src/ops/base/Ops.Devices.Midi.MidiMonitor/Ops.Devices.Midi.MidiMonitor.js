const inData = op.inObject('Event');

op.setPortGroup('MIDI', [inData]);

/* OUTPUTS */
const OUTPUT_KEYS = [
  'Device',
  'MIDI Channel',
  'Message Type',
  'Note',
  'Note Velocity',
  'CC Number',
  'CC Value',
  'Pitch Bend Value',
  'NRPN Number',
  'NRPN Value',
];

const eventOut = op.outObject('MIDI Event Out');
const triggerOut = op.outTrigger('Trigger Out');

// create outputs from keys specified above
const OUTPUTS = {
  'Device': op.outValue("Device", "-"),
  'MIDI Channel': op.outValue("MIDI Channel", "-"),
  'Message Type': op.outValue("Message Type", "-"),
  'Note': op.outValue("Note", "-"),
  'Note Velocity': op.outValue("Note Velocity", "-"),
  'CC Number': op.outValue("CC Number", "-"),
  'CC Value': op.outValue("CC Value", "-"),
  'Pitch Bend Value': op.outValue("Pitch Bend Value", "-"),
  'NRPN Number': op.outValue("NRPN Number", "-"),
  'NRPN Value': op.outValue("NRPN Value", "-"),
};

op.setPortGroup('MIDI/Trigger Out', [eventOut, triggerOut]);
op.setPortGroup('General Info', ['Device', 'MIDI Channel', 'Message Type'].map(key => OUTPUTS[key]));
op.setPortGroup('Note', ['Note', 'Note Velocity'].map(key => OUTPUTS[key]));
op.setPortGroup('CC', ['CC Number', 'CC Value'].map(key => OUTPUTS[key]));
op.setPortGroup('Pitch Bend', [OUTPUTS['Pitch Bend Value']]);
op.setPortGroup('NRPN', ['NRPN Number', 'NRPN Value'].map(key => OUTPUTS[key]));

/* http://midiio.sapp.org/src/MidiOutput.cpp for NRPN */
/* http://www.indiana.edu/~emusic/etext/MIDI/chapter3_MIDI3.shtml */

/*
The two things we can assume is that we will receive the NRPN index messages BEFORE the data
and that the LSB of the data will change every time we get an NRPN change.
*/

function getMIDIChannel(statusByte) {
  return (statusByte & 0x0f) + 1;
}

function getPitchBendValue(dataByte1LSB, dataByte2MSB) {
  const pitchBendValue = (dataByte2MSB << 7) + dataByte1LSB - 8192; //  scale to -1 to 1 = /8192;
  return pitchBendValue;
}

/* http://tetradev.blogspot.com/2010/03/nrpns-part-2-nrpns-in-ableton-with-max.html */
/* https://sites.uci.edu/camp2014/2014/04/30/managing-midi-pitchbend-messages/ */

inData.onChange = function() {
  const event = inData.get();

  if (!event || !event.data) return;
  const [statusByte, dataByte1LSB, dataByte2MSB] = event.data;
  /* We skip MIDI signals that at the moment are not relevant for CABLES,
       i.e. Ableton: if SYNC is on, every 2nd 3-Byte-Tuple sent
       is a Timing clock message
       we don't wanna show that for now, hence we skip everything above 248 */
  if (statusByte >= 248) {
    eventOut.set(event);
    triggerOut.trigger();
    return;
  }

  const { messageType, deviceName } = event;

  OUTPUTS['Device'].set(deviceName);
  OUTPUTS['MIDI Channel'].set(getMIDIChannel(statusByte));
  OUTPUTS['Message Type'].set(messageType);

  switch (messageType) {
    case 'NRPN':
      OUTPUTS['NRPN Number'].set(event.nrpnIndex);
      OUTPUTS['NRPN Value'].set(event.nrpnValue);
      Object.keys(OUTPUTS)
        .filter(
          key => !key.startsWith(messageType)
          && key !== 'Message Type' && key !== 'MIDI Channel' && key !== 'Device',
        )
        .forEach(filteredKey => OUTPUTS[filteredKey].set('-'));
      break;
    case 'CC':
      const [, ccIndex, ccValue] = event.data;
      OUTPUTS['CC Number'].set(ccIndex);
      OUTPUTS['CC Value'].set(ccValue);
      Object.keys(OUTPUTS)
        .filter(
          key => !key.startsWith(messageType)
          && key !== 'Message Type' && key !== 'MIDI Channel' && key !== 'Device',
        )
        .forEach(filteredKey => OUTPUTS[filteredKey].set('-'));
      break;
    case 'Note':
      const {
        newNote: [noteIndex],
        velocity,
      } = event;
      OUTPUTS.Note.set(noteIndex);
      OUTPUTS['Note Velocity'].set(velocity);
      Object.keys(OUTPUTS)
        .filter(
          key => !key.startsWith(messageType)
          && key !== 'Message Type' && key !== 'MIDI Channel' && key !== 'Device'
        )
        .forEach(filteredKey => OUTPUTS[filteredKey].set('-'));
      break;
    case 'Pitch Bend':
      OUTPUTS['Pitch Bend Value'].set(getPitchBendValue(dataByte1LSB, dataByte2MSB));
      Object.keys(OUTPUTS)
        .filter(
          key => !key.startsWith(messageType)
          && key !== 'Message Type' && key !== 'MIDI Channel' && key !== 'Device'
        )
        .forEach(filteredKey => OUTPUTS[filteredKey].set('-'));
      break;
    default:
      Object.keys(OUTPUTS)
        .filter(key => key !== 'Message Type' && key !== 'MIDI Channel' && key !== 'Device')
        .forEach(filteredKey => OUTPUTS[filteredKey].set('-'));
  }

  triggerOut.trigger();
  eventOut.set(event);
  // }
};
