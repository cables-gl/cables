# MidiValueToNote

*Ops.Devices.Midi.MidiValueToNote*  

Converts a MIDI value (e.g. `60` coming from a connected MIDI keyboard) to a note (e.g. `"C4"`). The octave will always be included at the end of the string, if it is below 0, it will look like `A#-1`.  

Please note that semitones will always be presented using sharps (#), not flats (*b*).

## Input

### Midi Value [Number]

The MIDI Value you want to convert to a note-string, e.g. `80`

## Output

### Note [String]

The note-string (compatible to [tone.js](https://github.com/Tonejs/Tone.js))