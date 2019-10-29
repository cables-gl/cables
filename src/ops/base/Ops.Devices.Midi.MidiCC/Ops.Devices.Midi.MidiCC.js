/* UTIL */
const MIDIChannels = Array.from(Array(16).keys(), i => i + 1);
/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const ccIndexDropdown = op.inValueInt('CC Index', 0);
const normalizeDropdown = op.inSwitch('Normalize', ['none', '0 to 1', '-1 to 1'], 'none');
const learn = op.inTriggerButton('learn');
const clear = op.inTriggerButton('clear');

op.setPortGroup('MIDI', [inEvent, midiChannelDropdown]);
op.setPortGroup('CC', [ccIndexDropdown, normalizeDropdown]);
op.setPortGroup('', [learn, clear]);

const ccArray = Array.from(Array(128).keys(), key => 0);

/* OUT */
const eventOut = op.outObject('Event');
const triggerOut = op.outTrigger('Trigger Out');
const ccIndexOut = op.outValue('CC Index Out');
const ccValueOut = op.outValue('CC Value Out');
const arrayOut = op.outArray("Value Array");

op.setPortGroup('MIDI/Trigger Out', [eventOut, triggerOut]);
op.setPortGroup('CC Out', [ccIndexOut, ccValueOut]);

arrayOut.set(ccArray);

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
  if(CABLES.UI && gui.patch().isCurrentOp(op)) gui.patch().showOpParams(op);
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

    if (normalizeDropdown.get() === '0 to 1') {
      ccArray[ccIndex] = ccValue / 127;

    } else if (normalizeDropdown.get() === '-1 to 1') {
      ccArray[ccIndex] = ccValue / (127 / 2) - 1;
    } else if (normalizeDropdown.get() === 'none') {
      ccArray[ccIndex] = ccValue;
    }

    if (ccIndex === ccIndexDropdown.get()) {
      ccIndexOut.set(ccIndex);
      let value = ccValue;
      ccArray[ccIndex] = ccValue;
      if (normalizeDropdown.get() === '0 to 1') {
        value = ccValue / 127;
        ccValueOut.set(value);
        ccArray[ccIndex] = ccValue;
        triggerOut.trigger();
      } else if (normalizeDropdown.get() === '-1 to 1') {

        value = ccValue / (127 / 2) - 1;
        triggerOut.trigger();
        ccValueOut.set(value);
        ccArray[ccIndex] = ccValue;
      } else if (normalizeDropdown.get() === 'none') {
        triggerOut.trigger();
        ccValueOut.set(value);
        ccArray[ccIndex] = ccValue;
      } else {
        ccArray[ccIndex] = 0;
        ccValue.set(0);
      }
    }
  }

  arrayOut.set(null);
  arrayOut.set(ccArray);
  eventOut.set(null);
  eventOut.set(event);
};
