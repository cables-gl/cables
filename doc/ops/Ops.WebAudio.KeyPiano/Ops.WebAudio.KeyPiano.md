# KeyPiano

*Ops.WebAudio.KeyPiano*  

Can be used to generate notes based on keyboard presses together with the `KeyLearn`-op. For every note the keyboard key can be defined in the corresponding `KeyLearn-op`, so e.g. you would add a `KeyLearn`-op, press its `learn`-button to store e.g. the key code for the key `c` and then you need to connect its `on press`-port with the `c note on`-port of `KeyPiano`. Please note that key-presses are only detected in the preview window by default (click inside to set the focus).  
Currently only one key can be played simultaneously.

## Input

### X Note On

*Type: Function*   
Note on ports for one octave. Typically connected to a `KeyLearn`-op. Will be triggered once the corresponding key has been pressed.

### X Note Off

*Type: Function*   
Note off ports for one octave. Typically connected to a `KeyLearn`-op. Will be triggered once the corresponding key has been released.

### Octave

*Type: Value*   
The currently active octave – `1` is the lowest, `7` the highest.
`[1-7]`

## Output

### Frequency

*Type: Value*   
The note frequency of the last pressed / released key in *Hz*, e.g. `440` for `A4` (middle A). This port can be connected to the `frequency`-port of an `oscillator`-op e.g..

### Is Pressed

*Type: Value*   
If one of the keys is currently pressed: `1.0`, if no key is pressed: `0.0`.  
Can e.g. be connected to a `Gain` node, to control the volume of a Web Audio op.

