
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIDIChannels = Array.from(Array(16).keys()).map(i => i + 1);

function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}

/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const learn = op.inTriggerButton('learn');

const inTranspose = op.inInt('Transpose Amount', 0);

op.setPortGroup('MIDI', [inEvent, midiChannelDropdown, learn]);
op.setPortGroup('Transpose', [inTranspose]);

/* OUT */
/* OUT */
const eventOut = op.outObject('MIDI Event Out');
const triggerOut = op.outTrigger('Trigger Out');

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
    const { note } = event;
    const transposeAmount = inTranspose.get();
    const newNoteIndex = Math.min(Math.max(note + transposeAmount, 0), 127);

    event.note = newNoteIndex;
    event.index = newNoteIndex;
    event.data[1] = newNoteIndex;
    event.newNote = [newNoteIndex, getMIDINote(newNoteIndex)];

    triggerOut.trigger();
  }
  eventOut.set(event);
};
