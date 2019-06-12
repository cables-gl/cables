This reworked midi device is the heart of all midi operations in cables.

In here you select the device of which you want to use to transmit midi data to cables.

It outputs MIDI events seperated by type (e.g. Clock, CC, Note).

Furthermore this device allows you to automatically create ops corresponding to the message you sent by pressing the "Learn" Button and, for example playing a note on your midi keyboard. This will automatically create a MidiNote op for you. Also works with CC and NRPN.

Press the panic button to send note-off or value-zero messages to all notes and CC indexes (Think of it as a kill switch).