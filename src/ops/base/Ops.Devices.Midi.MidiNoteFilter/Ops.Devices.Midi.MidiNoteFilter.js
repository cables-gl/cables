/* UTIL */
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const NOTE_VALUES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const MIDIChannels = Array.from(Array(16).keys()).map((i) => { return i + 1; });

function getMIDINote(dataByte1LSB)
{
    return dataByte1LSB <= 126
        ? NOTE_VALUES[dataByte1LSB % 12] + Math.floor(dataByte1LSB / 12) - 2 + " - " + dataByte1LSB
        : "NO NOTE";
}

function getNoteIndexFromMIDINote(midiNote)
{
    if (!midiNote || midiNote === "NO NOTE") return null;
    const string = midiNote.split("- ")[1];
    return Number(string);
}

const noteValues = Array.from(Array(128).keys()).map((key) => { return getMIDINote(key); });

/* IN */
// persistent array for learned notes
const learnedNotesIn = op.inArray("Note Values", []);
learnedNotesIn.setUiAttribs({ "hidePort": true });

const inEvent = op.inObject("MIDI Event");
const midiChannelDropdown = op.inValueSelect("MIDI Channel", MIDIChannels, 1);
const noteStartDropdown = op.inValueSelect("Note Start", noteValues, 0);
const noteEndDropdown = op.inValueSelect("Note End", noteValues, 0);
const normalizeDropdown = op.inValueSelect(
    "Normalize Velocity",
    ["none", "0 to 1", "-1 to 1"],
    "none"
);
const learn = op.inTriggerButton("learn");
const reset = op.inTriggerButton("reset");

op.setPortGroup("MIDI", [inEvent, midiChannelDropdown]);
op.setPortGroup("Notes", [noteStartDropdown, noteEndDropdown, normalizeDropdown]);

/* OUT */
const eventOut = op.outObject("Event");
const triggerOut = op.outTrigger("Trigger Out");
const noteIndexOut = op.outNumber("Current Note");
const velocityOut = op.outNumber("Velocity");
const gateOut = op.outBoolNum("Gate");

op.setPortGroup("MIDI/Trigger Out", [eventOut, triggerOut]);
op.setPortGroup("Notes Out", [noteIndexOut, velocityOut, gateOut]);

noteStartDropdown.set(0);
noteEndDropdown.set(0);
midiChannelDropdown.set(1);

let learning = false;

learn.onTriggered = () =>
{
    if (learnedNotesIn.get().length > 0)
    {
        learnedNotesIn.set([]);
    }
    learning = true;
};
reset.onTriggered = () =>
{
    learning = false;
    learnedNotesIn.set([]);
    noteStartDropdown.set(0);
    noteEndDropdown.set(0);
    midiChannelDropdown.set(1);
    op.refreshParams();
};

let selfRef = false;
noteStartDropdown.onChange = () =>
{
    const learnedNotes = learnedNotesIn.get();
    learnedNotes[0] = getNoteIndexFromMIDINote(noteStartDropdown.get());
    op.refreshParams();

    if (selfRef) return;
    if (learnedNotes.length === 2)
    {
        selfRef = true;
        learnedNotes.sort((a, b) => { return a - b; });
        const [start, end] = learnedNotes;
        noteStartDropdown.set(getMIDINote(start));
        noteEndDropdown.set(getMIDINote(end));
        selfRef = false;
    }
    learnedNotesIn.set(learnedNotes);
};

noteEndDropdown.onChange = () =>
{
    const learnedNotes = learnedNotesIn.get();
    learnedNotes[1] = getNoteIndexFromMIDINote(noteEndDropdown.get());
    op.refreshParams();

    if (selfRef) return;
    if (learnedNotes.length === 2)
    {
        selfRef = true;
        learnedNotes.sort((a, b) => { return a - b; });
        const [start, end] = learnedNotes;
        noteStartDropdown.set(getMIDINote(start));
        noteEndDropdown.set(getMIDINote(end));
        selfRef = false;
    }
    learnedNotesIn.set(learnedNotes);
};

inEvent.onChange = () =>
{
    const event = inEvent.get();
    if (!event) return;
    if (event.messageType !== "Note") return;
    if (!event.newNote) return;

    const [statusByte] = event.data;

    const newNote = event.newNote;
    const velocity = newNote.velocity;
    const [noteIndex, _noteName] = newNote;
    const midiNote = getMIDINote(noteIndex);
    const learnedNotes = learnedNotesIn.get();

    if (learning)
    {
        if (statusByte >> 4 === NOTE_OFF)
        {
            eventOut.set(event);
            return;
        }
        if (!learnedNotes.includes(midiNote) && learnedNotes.length < 2)
        {
            learnedNotes.push(noteIndex);
            learnedNotesIn.set(learnedNotes);
        }
        if (learnedNotes.length === 2)
        {
            learnedNotes.sort((a, b) => { return a - b; });
            learnedNotesIn.set(learnedNotes);
            const [start, end] = learnedNotes;

            noteStartDropdown.set(getMIDINote(start));
            noteEndDropdown.set(getMIDINote(end));
            learning = false;
        }

        midiChannelDropdown.set(event.channel + 1);

        if (CABLES.UI)
        {
            gui.emitEvent("portValueEdited", op, midiChannelDropdown, midiChannelDropdown.get());
            gui.emitEvent("portValueEdited", op, learnedNotesIn, learnedNotesIn.get());
            gui.emitEvent("portValueEdited", op, noteEndDropdown, noteEndDropdown.get());
            gui.emitEvent("portValueEdited", op, noteStartDropdown, noteStartDropdown.get());

            op.uiAttr({ "info": "Start bound to Note: " + noteStartDropdown.get() });
            op.uiAttr({ "info": "End bound to Note: " + noteEndDropdown.get() });
            op.refreshParams();
        }
        eventOut.set(event);
        return;
    }

    if (event.channel === midiChannelDropdown.get() - 1 && learnedNotes.length === 2)
    {
        const [start, end] = learnedNotes;
        if (start <= noteIndex && noteIndex <= end)
        {
            if (statusByte >> 4 === NOTE_OFF || velocity === 0)
            {
                gateOut.set(false);
                if (velocity === 0) velocityOut.set(0);
            }
            if (statusByte >> 4 === NOTE_ON)
            {
                gateOut.set(true);

                noteIndexOut.set(noteIndex);
                triggerOut.trigger();

                if (normalizeDropdown.get() === "0 to 1")
                {
                    velocityOut.set((1 / 126) * (velocity - 1));
                }
                else if (normalizeDropdown.get() === "-1 to 1")
                {
                    const normalizedValue = (2 / 126) * (velocity - 1) - 1;
                    velocityOut.set(normalizedValue);
                }
                else if (normalizeDropdown.get() === "none") velocityOut.set(velocity);
            }
        }
    }

    eventOut.set(event);
};
