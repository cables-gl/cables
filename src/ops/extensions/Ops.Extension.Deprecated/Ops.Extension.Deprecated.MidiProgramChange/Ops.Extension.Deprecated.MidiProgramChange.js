/* UTIL */
const MIDIChannels = Array.from(Array(16).keys(), (i) => { return i + 1; });
/* IN */
const inEvent = op.inObject("MIDI Event In");
const midiChannelDropdown = op.inValueSelect("MIDI Channel", MIDIChannels, 1);
const normalizeDropdown = op.inSwitch("Normalize", ["none", "0 to 1", "-1 to 1"], "none");

op.setPortGroup("MIDI", [inEvent, midiChannelDropdown]);
op.setPortGroup("Program Change", [normalizeDropdown]);

/* OUT */
const eventOut = op.outObject("Event");
const triggerOut = op.outTrigger("Trigger Out");
const pcValueOut = op.outValue("Program Change Value Out");

op.setPortGroup("MIDI/Trigger Out", [eventOut, triggerOut]);
op.setPortGroup("Program Change Out", [pcValueOut]);

midiChannelDropdown.set(1);
normalizeDropdown.set(normalizeDropdown.get("none"));

inEvent.onChange = () =>
{
    const event = inEvent.get();
    if (!event) return;
    if (event.messageType !== "Program Change") return;

    const [, pcValue] = event.data;

    if (event.channel === midiChannelDropdown.get() - 1)
    {
        let value = pcValue;
        if (normalizeDropdown.get() === "0 to 1")
        {
            value = pcValue / 127;
            pcValueOut.set(value);
            triggerOut.trigger();
        }
        else if (normalizeDropdown.get() === "-1 to 1")
        {
            value = pcValue / (127 / 2) - 1;
            triggerOut.trigger();
            pcValueOut.set(value);
        }
        else if (normalizeDropdown.get() === "none")
        {
            triggerOut.trigger();
            pcValueOut.set(value);
        }
        else
        {
            pcValue.set(0);
        }
    }

    eventOut.set(null);
    eventOut.set(event);
};
