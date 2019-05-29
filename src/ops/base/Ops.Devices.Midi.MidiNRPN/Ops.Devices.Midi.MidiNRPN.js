/* UTIL */
const MIDIChannels = Array.from(Array(16).keys()).map(i => i + 1);

/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);

const nrpnIndexDropdown = op.inValueInt('NRPN Index', 0);
const normalizeDropdown = op.inValueSelect('Normalize', ['none', '0 to 1', '-1 to 1'], 'none');
const learn = op.inTriggerButton('learn');

/* OUT */
const eventOut = op.outObject('MIDI Event Out');
const nrpnIndexOut = op.outValue('NRPN Index');
const nrpnValueOut = op.outValue('NRPN Value');

nrpnIndexDropdown.set(0);
midiChannelDropdown.set(1);
normalizeDropdown.set(normalizeDropdown.get('none'));

let learning = false;
learn.onTriggered = () => {
  learning = true;
};

var outValue;
inEvent.onChange = () => {
  const event = inEvent.get();
  if (!event) return;
  if (event.messageType !== 'NRPN') return;

  const { channel, nrpnIndex, nrpnValue } = event;

  if (learning) {
    nrpnIndexDropdown.set(nrpnIndex);
    midiChannelDropdown.set(channel + 1);

    learning = false;

    if (CABLES.UI) {
      op.uiAttr({ info: `bound to NRPN: ${nrpnIndexDropdown.get()}` });
      gui.patch().showOpParams(op);
    }
  }

  if (channel === midiChannelDropdown.get() - 1) {
    if (nrpnIndex === nrpnIndexDropdown.get()) {
      nrpnIndexOut.set(nrpnIndex);

      outValue = nrpnValue;

      if (normalizeDropdown.get() === '0 to 1') nrpnValueOut.set(outValue / 16383);
      else if (normalizeDropdown.get() === '-1 to 1') nrpnValueOut.set(outValue / (16383 / 2) - 1);
      else if (normalizeDropdown.get() === 'none') nrpnValueOut.set(outValue);
      else nrpnValueOut.set(0);
    }
  }
  eventOut.set(event);
};
