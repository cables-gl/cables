const MIDIChannels = Array.from(Array(16).keys(), (i) => { return i + 1; });

const
    inEvent = op.inObject("MIDI Event In"),
    midiChannelDropdown = op.inValueSelect("MIDI Channel", MIDIChannels, 1),
    ccIndexDropdown = op.inValueInt("CC Index", 0),
    inSpeed = op.inFloat("Speed", 1),
    normalizeDropdown = op.inSwitch("Normalize", ["none", "0 to 1", "-1 to 1"], "0 to 1"),
    triggerOn = op.inSwitch("Trigger On", ["Both", "Down", "Up"], "Down"),
    learn = op.inTriggerButton("learn"),
    clear = op.inTriggerButton("clear");

const
    ccValueOut = op.outNumber("CC Value Out"),
    eventOut = op.outObject("Event"),
    triggerOut = op.outTrigger("Trigger Out"),
    ccIndexOut = op.outNumber("CC Index Out");

let dia = null;
let learning = false;
learn.onTriggered = () =>
{
    if (CABLES.UI)
    {
        dia = new CABLES.UI.ModalDialog({
            "title": "Learn Key...",
            "text": "Just press any key" });

        dia.on("close", () =>
        {
            learning = false;
            removeListeners();
            addListener();
            dia = null;
        });
    }

    learning = true;
};

clear.onTriggered = () =>
{
    ccIndexDropdown.set(0);
    midiChannelDropdown.set(1);
    normalizeDropdown.set(normalizeDropdown.get("0 to 1"));
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
        if (dia)dia.close();
        dia = null;

        if (CABLES.UI)
        {
            gui.emitEvent("portValueEdited", op, ccIndexDropdown, ccIndexDropdown.get());
            gui.emitEvent("portValueEdited", op, midiChannelDropdown, midiChannelDropdown.get());

            op.refreshParams();
        }
    }

    if (event.channel === midiChannelDropdown.get() - 1)
    {
        if (ccIndex === ccIndexDropdown.get())
        {
            ccIndexOut.set(ccIndex);

            if (normalizeDropdown.get() === "0 to 1")
            {
                const value = ccValue / 127;
                ccValueOut.set(value);

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else if (normalizeDropdown.get() === "-1 to 1")
            {
                const value = ccValue / (127 / 2) - 1;

                ccValueOut.set(value);

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else if (normalizeDropdown.get() === "none")
            {
                ccValueOut.set(ccValue);

                if (triggerOn.get() == "Both") triggerOut.trigger();
                else if (triggerOn.get() == "Down" && ccValue != 0) triggerOut.trigger();
                else if (triggerOn.get() == "Up" && ccValue == 0) triggerOut.trigger();
            }
            else
            {
                ccValue.set(0);
            }
        }
    }

    eventOut.setRef(event);
};
