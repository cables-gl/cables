
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIDIChannels = Array.from(Array(16).keys()).map(i => i + 1);
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;

function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}

/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const inTranspose = op.inInt('Transpose Amount', 0);
const learn = op.inTriggerButton('learn');



op.setPortGroup('MIDI', [inEvent, midiChannelDropdown, learn]);
op.setPortGroup('Transpose', [inTranspose]);

/* OUT */
/* OUT */
const eventOut = op.outObject('MIDI Event Out');
const triggerOut = op.outTrigger('Trigger Out');

const killAllNotes = () => {
  for (let i = 0; i < 128; i += 1) {
    for (let channel = 0; channel < 16; channel += 1) {
        eventOut.set(null);
        eventOut.set({ data: [(NOTE_OFF << 4 | channel), i, 0] });
    }
    console.log("killAllNotes outputdevice");
  }
};

inTranspose.onChange = killAllNotes;

let learning = false;
learn.onTriggered = () => {
  learning = true;
};

inEvent.onChange = () => {
  const event = inEvent.get();

  if (!event) return;
  if (event.messageType !== 'Note') return;
  if (!event.newNote) return;

  if (learning) {
    midiChannelDropdown.set(event.channel + 1);
    learning = false;
    if (CABLES.UI) {
      op.uiAttr({ info: `bound to MIDI Channel: ${midiChannelDropdown.get()}` });
      gui.patch().showOpParams(op);
    }
  }

  if (event.channel === midiChannelDropdown.get() - 1) {
    const note = event.index;
    const transposeAmount = inTranspose.get();
    const newNoteIndex = Math.min(Math.max(note + transposeAmount, 0), 127);
    console.log(NOTE_ON << 4 | (event.channel));
    if (event.data[0] === (NOTE_ON << 4 | (event.channel))) {
        eventOut.set(null);
        eventOut.set(Object.assign({}, event, {
            data: [(NOTE_OFF << 4 | (event.channel)), note, 0],
            note: note,
            index: note,
            newNote: [note, getMIDINote(note)],
        }));
    }

    event.note = newNoteIndex;
    event.index = newNoteIndex;
    event.data[1] = newNoteIndex;
    event.newNote = [newNoteIndex, getMIDINote(newNoteIndex)];

    triggerOut.trigger();
  }
  eventOut.set(null);
  eventOut.set(event);
};
