# ToneTime

*Ops.WebAudio.Lib.Tonejs.ToneTime*  

Generates a [tone.js](https://tonejs.github.io) Time (used e.g. to specify note lengths). Tone.js expects a string representing time in various places, e.g. when triggering a tone on a synth. There are multiple ways to express time.

See [github.com/Tonejs/Tone.js/wiki/Time](https://github.com/Tonejs/Tone.js/wiki/Time) for more information.

## Input

### Time [Number]

The time to be converted to a tone.js-compatible time-format

### Time Type [String]

Either `Note`, `Triplet`, `Measure`, `Second`, `Frequency` or `Tick`.  

See [Time](https://github.com/Tonejs/Tone.js/wiki/Time) for more infos.

### Relative To Now [Bool]

When set the output string will be prefixed by a `+`-character – so the time will be interpreted as «the current time plus whatever expression follows»

## Output

### Tone Time [String]

A string representing time, to be used together with another tone.js-op