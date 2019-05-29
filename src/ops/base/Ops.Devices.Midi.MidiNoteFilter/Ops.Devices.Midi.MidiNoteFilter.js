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
// persistent array for learned notes
const learnedNotesIn = op.inArray('Note Values', []);
learnedNotesIn.setUiAttribs({ hidePort: true });

const inEvent = op.inObject('MIDI Event');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const noteStartDropdown = op.inValueSelect('Note Start', noteValues, 0);
const noteEndDropdown = op.inValueSelect('Note End', noteValues, 0);
const normalizeDropdown = op.inValueSelect(
  'Normalize Velocity',
  ['none', '0 to 1', '-1 to 1'],
  'none',
);
const learn = op.inTriggerButton('learn');
const reset = op.inTriggerButton('reset');

/* OUT */
const eventOut = op.outObject('Event');
const noteNameOut = op.outValue('Note Name');
const noteIndexOut = op.outValue('Note Index');
const velocityOut = op.outValue('Velocity');
const gateOut = op.outValueBool('Gate');

noteStartDropdown.set(0);
noteEndDropdown.set(0);
midiChannelDropdown.set(1);

let learning = false;

learn.onTriggered = () => {
  learning = true;
};
reset.onTriggered = () => {
  learning = false;
  learnedNotesIn.set([]);
  noteStartDropdown.set(0);
  noteEndDropdown.set(0);
  midiChannelDropdown.set(1);
};

inEvent.onChange = () => {
  const event = inEvent.get();
  if (!event) return;
  if (event.messageType !== 'Note') return;
  if (!event.newNote) return;

  const [statusByte] = event.data;

  const { newNote, velocity } = event;
  const [noteIndex, noteName] = newNote;
  const midiNote = getMIDINote(noteIndex);
  const learnedNotes = learnedNotesIn.get();
  if (learning) {
    if (statusByte >> 4 === NOTE_OFF) {
      eventOut.set(event);
      return;
    }
    if (!learnedNotes.includes(midiNote) && learnedNotes.length < 2) {
      learnedNotes.push(noteIndex);
      learnedNotesIn.set(learnedNotes);
    }
    if (learnedNotes.length === 2) {
      learnedNotes.sort((a, b) => a - b);
      learnedNotesIn.set(learnedNotes);
      const [start, end] = learnedNotes;

      noteStartDropdown.set(getMIDINote(start));
      noteEndDropdown.set(getMIDINote(end));
      learning = false;
    }

    midiChannelDropdown.set(event.channel + 1);

    if (CABLES.UI) {
      op.uiAttr({ info: `Start bound to Note: ${noteStartDropdown.get()}` });
      op.uiAttr({ info: `End bound to Note: ${noteEndDropdown.get()}` });
      gui.patch().showOpParams(op);
    }
    eventOut.set(event);
    return;
  }

  if (event.channel === midiChannelDropdown.get() - 1 && learnedNotes.length === 2) {
    const [start, end] = learnedNotes;
    if (start <= noteIndex && noteIndex <= end) {
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
