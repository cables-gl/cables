Can be used to generate notes based on keyboard presses together with the `KeyLearn`-op. For every note the keyboard key can be defined in the corresponding `KeyLearn-op`, so e.g. you would add a `KeyLearn`-op, press its `learn`-button to store e.g. the key code for the key `c` and then you need to connect its `on press`-port with the `c note on`-port of `KeyPiano`. Please note that key-presses are only detected in the preview window by default (click inside to set the focus).  
Currently only one key can be played simultaneously.

The `Note On` / `Note Off` can be connected to a Ops.Devices.Keyboard.KeyPressLearn op.

