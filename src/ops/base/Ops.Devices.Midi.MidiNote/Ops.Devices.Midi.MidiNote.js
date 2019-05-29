/* UTIL */
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIDIChannels = Array.from(Array(16).keys()).map(i => i + 1);

function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}

const noteValues = Array.from(Array(128).keys()).map(key => getMIDINote(key));

/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const noteDropdown = op.inValueSelect('Note', noteValues, 0);
const normalizeDropdown = op.inValueSelect(
  'Normalize Velocity',
  ['none', '0 to 1', '-1 to 1'],
  'none',
);
const learn = op.inTriggerButton('learn');

/* OUT */
const eventOut = op.outObject('MIDI Event Out');
const noteNameOut = op.outValue('Note Name');
const noteIndexOut = op.outValue('Note Index');
const velocityOut = op.outValue('Velocity');
const gateOut = op.outValueBool('Gate');
const currentNoteOut = op.outValue('Current Note');

noteDropdown.set(0);
midiChannelDropdown.set(1);

let learning = false;
learn.onTriggered = () => {
  learning = true;
};

inEvent.onChange = () => {
  const event = inEvent.get();
  if (!event) return;
  if (event.messageType !== 'Note') return;
  if (!event.newNote) return;

  const [statusByte] = event.data;

  const { newNote, velocity } = event;
  const [noteIndex, noteName] = newNote;

  if (learning) {
    noteDropdown.set(noteName);
    midiChannelDropdown.set(event.channel + 1);

    learning = false;

    if (CABLES.UI) {
      op.uiAttr({ info: `bound to Note: ${noteDropdown.get()}` });
      gui.patch().showOpParams(op);
    }
  }

  if (event.channel === midiChannelDropdown.get() - 1) {
    currentNoteOut.set(noteIndex);
    if (getMIDINote(noteIndex) === noteDropdown.get()) {
      if (statusByte >> 4 === NOTE_OFF || velocity === 0) {
        gateOut.set(false);
        if (velocity === 0) velocityOut.set(0);
      }

      if (statusByte >> 4 === NOTE_ON) {
        gateOut.set(true);
        noteNameOut.set(noteName);
        noteIndexOut.set(noteIndex);

        velocityOut.set(velocity);

        if (normalizeDropdown.get() === '0 to 1') velocityOut.set(velocity / 127);
        else if (normalizeDropdown.get() === '-1 to 1') {
          const normalizedValue = velocity / (127 / 2) - 1;

          velocityOut.set(normalizedValue);
        } else if (normalizeDropdown.get() === 'none') velocityOut.set(velocity);
      }
    }
  }

  eventOut.set(event);
};
