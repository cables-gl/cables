/* UTIL */
const MIDIChannels = Array.from(Array(16).keys(), (i) => { return i + 1; });
/* IN */
const inEvent = op.inObject("MIDI Event In");
const midiChannelDropdown = op.inValueSelect("MIDI Channel", MIDIChannels, 1);
const ccIndexDropdown = op.inValueInt("CC Index", 0);

const inSpeed = op.inFloat("Speed", 1);
const normalizeDropdown = op.inSwitch("Normalize", ["none", "0 to 1", "-1 to 1"], "none");
const triggerOn = op.inSwitch("Trigger On", ["Both", "Down", "Up"], "Both");
const learn = op.inTriggerButton("learn");
const clear = op.inTriggerButton("clear");

op.setPortGroup("MIDI", [inEvent, midiChannelDropdown]);
op.setPortGroup("CC", [ccIndexDropdown, normalizeDropdown]);
op.setPortGroup("", [learn, clear]);

const ccArray = Array.from(Array(128).keys(), (key) => { return 0; });

/* OUT */
const eventOut = op.outObject("Event");
const triggerOut = op.outTrigger("Trigger Out");
const ccIndexOut = op.outNumber("CC Index Out");
const ccValueOut = op.outNumber("CC Value Out");
const arrayOut = op.outArray("Value Array");

op.setPortGroup("MIDI/Trigger Out", [eventOut, triggerOut]);
op.setPortGroup("CC Out", [ccIndexOut, ccValueOut]);

arrayOut.set(ccArray);

ccIndexDropdown.set(0);
midiChannelDropdown.set(1);
normalizeDropdown.set(normalizeDropdown.get("none"));

let learning = false;
learn.onTriggered = () =>
{
    learning = true;
};

clear.onTriggered = () =>
{
    ccIndexDropdown.set(0);
    midiChannelDropdown.set(1);
    normalizeDropdown.set(normalizeDropdown.get("none"));
    op.refreshParams();
};

inEvent.onChange = () =>
{
    const event = inEvent.get();
    if (!event) return;
    if (event.messageType !== "CC") return;

    let [, ccIndex, ccValue] = event.data;
    if (learning)
    {
        ccIndexDropdown.set(ccIndex);
        midiChannelDropdown.set(event.channel + 1);

        learning = false;

        if (CABLES.UI)
        {
            gui.emitEvent("portValueEdited", op, ccIndexDropdown, ccIndexDropdown.get());
            gui.emitEvent("portValueEdited", op, midiChannelDropdown, midiChannelDropdown.get());

            op.uiAttr({ "info": `bound to CC: ${ccIndexDropdown.get()}` });
            op.refreshParams();
        }
    }

    if (event.channel === midiChannelDropdown.get() - 1)
    {
        if (normalizeDropdown.get() === "0 to 1")
        {
            ccArray[ccIndex] = ccValue / 127;
        }
        else if (normalizeDropdown.get() === "-1 to 1")
        {
            ccArray[ccIndex] = ccValue / (127 / 2) - 1;
        }
        else if (normalizeDropdown.get() === "none")
        {
            ccArray[ccIndex] = ccValue;
        }

        if (ccIndex === ccIndexDropdown.get())
        {
            ccIndexOut.set(ccIndex);
            let value = ccValue;
            ccArray[ccIndex] = ccValue;
            if (normalizeDropdown.get() === "0 to 1")
            {
                value = ccValue / 127;
                ccValueOut.set(value);
                ccArray[ccIndex] = ccValue;

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else if (normalizeDropdown.get() === "-1 to 1")
            {
                value = ccValue / (127 / 2) - 1;

                ccValueOut.set(value);
                ccArray[ccIndex] = ccValue;

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else if (normalizeDropdown.get() === "none")
            {
                ccValueOut.set(value);
                ccArray[ccIndex] = ccValue;

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else
            {
                ccArray[ccIndex] = 0;
                ccValue.set(0);
            }
        }
    }

    // arrayOut.set(null);
    arrayOut.setRef(ccArray);
    // eventOut.set(null);
    eventOut.setRef(event);
};
