
## midi input

![](/imgdoc/example_midi.png)

- op ```Ops.Devices.MidiInput``` listens to any midi input events

- using ```Ops.Devices.MidiValue``` you can receive a value of a midi note


click on the ```midiInput``` and then use a knob on your midi device. the output parameter ```note``` will show the note id of the knob. use this id in your ```midiValue``` Op to get the value of this specific knob.

<!-- [edit midi example project](/ui/#/project/56458f09d5f7b7e95802f1a0) -->
