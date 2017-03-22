# LFO

*Ops.WebAudio.Lib.Tonejs.Component.Lfo*  

LFO stands for low frequency oscillator. `LFO` produces an output signal which can be attached to an audio parameter in order to modulate that it with an oscillator.  

The LFO can also be synced to the transport to start/stop and change when the tempo changes (*not implemented yet*).

*Please note*: square-waves do not approximate ±1, more like ±0.85, so if you want to modulate the frequency of an oscillator e.g. the result will be slightly off, see [Tone.js Github discussion](https://github.com/Tonejs/Tone.js/issues/125)

## Input

### Frequency [Number]

The LFO’s frequency

### Amplitude [Number]

The amplitude of the LFO, which controls the output range between the min and max output. For example if the min is -10 and the max is 10, setting the amplitude to 0.5 would make the LFO modulate between -5 and 5.

### Min [Number]

The miniumum output of the LFO.

### Max [Number]

The maximum output of the LFO.

### Type [String]

The type of the oscillator: sine, square, sawtooth, triangle.

### Phase [Number]

The phase of the LFO.

### Volume [Number]

The volume of the output in decibels.

### Mute [Bool]

Mute the output.

## Output

### Audio Out [Audio]

The signal