# AmplitudeEnvelope

*Ops.WebAudio.Lib.Tonejs.Component.Envelope.AmplitudeEnvelope*   

## Input

### Attack [Number]

When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.

### Decay [Number]

After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.

### Sustain [Number]

The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.

### Release [Number]

After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.

### Attack Curve [String]

The shape of the attack. Can be any of these strings:

- linear
- exponential
- sine
- cosine
- bounce
- ripple
- step

### Release Curve [String]

The shape of the release. See the attack curve types.

## Output

### Audio Out [Audio] 

