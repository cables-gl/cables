# Namespaces

Every op has two short name, e.g. `KeyboardInput` and a namespace, e.g. `Ops.Devices.Keyboard.KeyboardInput`.  

The name will be presented to the user in the patch-view, the long version exists to group similar ops together. In the op-add-dialog (when pressing `ESC` in the patch-view) users can click on any part of the namespace to view all ops with that namespace.

## Naming Conventions

All namespace-segments as well as the op name must be written in upper camel case, e.g. `KeyboardInput`, not `keyboard_input` or `keyboardInput`.

If your op uses an abbreviation, e.g. `MIDI` only the first character should be capitalized, so if you made a MIDI-input, a good name would be `MidiInput`.

**Please note:** Op-namespaces can not contain the full namespace of another op, e.g. if an op `Ops.Devices.Keyboard` exists,s you cannot put your newly created op in the namespace `Ops.Devices.Keyboard.KeyboardInput`.
