/* UTIL */
const MIDIChannels = Array.from(Array(16).keys(), i => i + 1);
/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const ccIndexDropdown = op.inValueInt('CC Index', 0);
const normalizeDropdown = op.inValueSelect('Normalize', ['none', '0 to 1', '-1 to 1'], 'none');
const learn = op.inTriggerButton('learn');
const clear = op.inTriggerButton('clear');
/* OUT */
const eventOut = op.outObject('Event');
const ccIndexOut = op.outValue('CC Index Out');
const ccValueOut = op.outValue('CC Value Out');
const triggerOut = op.outTrigger("Trigger Out");
ccIndexDropdown.set(0);
midiChannelDropdown.set(1);
normalizeDropdown.set(normalizeDropdown.get('none'));

let learning = false;
learn.onTriggered = () => {
  learning = true;
};

clear.onTriggered = () => {
  ccIndexDropdown.set(0);
  midiChannelDropdown.set(1);
  normalizeDropdown.set(normalizeDropdown.get('none'));
};

inEvent.onChange = () => {
  const event = inEvent.get();
  if (!event) return;
  if (event.messageType !== 'CC') return;

  const [, ccIndex, ccValue] = event.data;
  if (learning) {
    ccIndexDropdown.set(ccIndex);
    midiChannelDropdown.set(event.channel + 1);

    learning = false;

    if (CABLES.UI) {
      op.uiAttr({ info: `bound to CC: ${ccIndexDropdown.get()}` });
      gui.patch().showOpParams(op);
    }
  }

  if (event.channel === midiChannelDropdown.get() - 1) {
    if (ccIndex === ccIndexDropdown.get()) {
      ccIndexOut.set(ccIndex);

      if (normalizeDropdown.get() === '0 to 1') {
        ccValueOut.set(ccValue / 127);
        triggerOut.trigger();
      } else if (normalizeDropdown.get() === '-1 to 1') {
        const normalizedValue = ccValue / (127 / 2) - 1;
        triggerOut.trigger();
        ccValueOut.set(normalizedValue);
      } else if (normalizeDropdown.get() === 'none') {
        triggerOut.trigger();
        ccValueOut.set(ccValue);
      } else {
        ccValue.set(0);
      }
    }
  }

  eventOut.set(event);
};
