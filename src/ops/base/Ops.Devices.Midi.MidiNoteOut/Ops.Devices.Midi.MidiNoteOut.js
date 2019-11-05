const MIDIChannels = Array.from(Array(16).keys(), i => i + 1);
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;

function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}

const noteValues = Array.from(Array(128).keys(), key => getMIDINote(key));
const velocityArray = Array.from(Array(128).keys(), key => 0);

const inChannel = op.inDropDown("MIDI Channel", MIDIChannels, "1");
const inNoteDropdown = op.inDropDown("Note", noteValues);
const inNoteNumber = op.inInt("Note Number", 0);
const inVelocity = op.inInt("Velocity", 0);
const inMin = op.inFloat("Min In Velocity", 0);
const inMax = op.inFloat("Max In Velocity", 1);
const inNoteArray = op.inArray("Velocity Array In");
op.setPortGroup("General",[inChannel, inNoteDropdown]);
op.setPortGroup("Note",[inNoteNumber, inVelocity]);
op.setPortGroup("Velocity Range",[inMin, inMax]);

const outEvent = op.outObject("MIDI Event Out");


// this is a safety mechanism for when changing a note while another one is playing, kill old one
var currentNote = null;
const killAllNotes = () => {
  for (let i = 0; i < 128; i += 1) {
    console.log("killAllNotes midinoteout");
    outEvent.set(null);
    outEvent.set({ data: [(NOTE_OFF << 4 | (inChannel.get() - 1)), i, 0] });
  }
};

const killLastNote = () => {
  console.log("killLastNote midinoteout");
  outEvent.set(null);
  outEvent.set({ data: [(NOTE_OFF << 4 | (inChannel.get() - 1)), currentNote, 0] });
};

inNoteNumber.onLinkChanged = function() {
    if (!inNoteNumber.isLinked()) killLastNote();
}

inVelocity.onLinkChanged = function() {
    if (!inVelocity.isLinked()) killAllNotes();
}

inNoteArray.onLinkChanged = function() {
    if (!inNoteArray.isLinked()) killAllNotes();
}

inNoteDropdown.onChange = inChannel.onChange = killLastNote;

inVelocity.onChange = function() {
    console.log("inveloOnchange");
    /* if (!inNoteDropdown.get()) {
       // if (!op.uiAttribs.error) op.uiAttr({ error: "Please choose a MIDI Note!" });
        return;
    }
    */
    // if (op.uiAttribs.error) op.uiAttr({ error: null });

    const val = inVelocity.get();
    const noteNumber = inNoteNumber.get();
    const velocity = Math.floor(CABLES.map(val,inMin.get(), inMax.get(), 0, 127));

    let noteIndex = Math.floor(clamp(noteNumber, 0, 127));

    if (inNoteDropdown.get() !== 0) noteIndex = clamp(Number(inNoteDropdown.get().split("-").pop()), 0, 127);

    else {
        if (currentNote) {
            if (noteIndex !== currentNote) {
                const killEvent = {
                    deviceName: null,
                    output: null,
                    inputId: 0,
                    messageType: "Note",
                    data: [(NOTE_OFF << 4 | (inChannel.get() - 1)), currentNote, 0],
                    index: currentNote,
                    value: 0,
                    newNote: [currentNote, getMIDINote(currentNote)],
                    velocity: 0,
                    channel: inChannel.get() - 1,
                }
                outEvent.set(null);
                outEvent.set(killEvent);
            }
        }
    }

    const data = velocity > 0 ?
        [(NOTE_ON << 4 | (inChannel.get() - 1)), noteIndex, velocity]
        : [(NOTE_OFF << 4 | (inChannel.get() - 1)), noteIndex, velocity];

  const event = {
      deviceName: null,
      output: null,
      inputId: 0,
      messageType: "Note",
      data: data,
      index: noteIndex,
      value: velocity,
      newNote: [noteIndex, getMIDINote(noteIndex)],
      velocity,
      channel: inChannel.get() - 1,
  }


  outEvent.set(null);
  outEvent.set(event);
  currentNote = noteIndex;
}
var oldArr = [];

inNoteArray.onChange = function () {
    if (!inNoteArray.get()) return;
    const arr = inNoteArray.get();
    const length = arr.length > 127 ? 128 : arr.length;

    for (let i = 0; i < length; i += 1) {

        const velocity = Math.floor(CABLES.map(arr[i],inMin.get(), inMax.get(), 0, 127));
        const event = {
            deviceName: null,
            output: null,
            inputId: 0,
            messageType: "Note",
            data: velocity > 0 ?
                    [(NOTE_ON << 4 | (inChannel.get() - 1)), i, velocity]
                    : [(NOTE_OFF << 4 | (inChannel.get() - 1)), i, velocity],
            index: i,
            value: velocity,
            newNote: [i, getMIDINote(i)],
            velocity,
            channel: inChannel.get() - 1,
        }

        oldArr = arr;
        // console.log(event.data);
        outEvent.set(null);
        outEvent.set(event);
    }
}