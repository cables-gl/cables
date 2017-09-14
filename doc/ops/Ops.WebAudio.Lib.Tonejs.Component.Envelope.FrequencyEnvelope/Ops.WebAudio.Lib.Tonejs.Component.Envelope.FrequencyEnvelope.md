# FrequencyEnvelope

*Ops.WebAudio.Lib.Tonejs.Component.Envelope.FrequencyEnvelope*  

FrequencyEnvelope is a ScaledEnvelope, but instead of `min` and `max` it’s got a baseFrequency and octaves parameter.

## Input

### Base Frequency [Number]

The envelope's mininum output value. This is the value which it starts at.

### Octaves [Number]

The number of octaves above the baseFrequency that the envelope will scale to.

### Attack [Number]

When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.

### Decay [Number]

After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.

### Sustain [Number]

The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.

### Release [Number]

After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.

### Attack Curve [String]

The shape of the attack.

### Release Curve [String]

The shape of the release.

### Exponent [Number]

The envelope's exponent value.

## Output

### Audio Out [Audio]

Can be connected to the `Frequency`-port of an `Oscillator` e.g.  