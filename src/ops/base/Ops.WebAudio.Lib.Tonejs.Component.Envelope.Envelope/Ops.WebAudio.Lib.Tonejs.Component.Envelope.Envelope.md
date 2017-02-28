# Envelope

*Ops.WebAudio.Lib.Tonejs.Component.Envelope.Envelope*  

Envelopeis an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope) envelope generator. [Tone.Envelope](https://tonejs.github.io/docs/#Envelope) outputs a signal which can be connected to dynamic input port of another tone.js-op or a signal. The second output port can be used to set the ADSR on synth-ops.

## Input

### Attack [Number]

When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.

### Decay [Number]

After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.

### Sustain [Number]

The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.

### Release [Number]

After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.

### Trigger Attack [Function]

Trigger the attack/decay portion of the ADSR envelope.

### Trigger Release [Function]

Triggers the release of the envelope.

### Time [String, Number]

When `Trigger Attack` / `Trigger Release` is triggered this is the time when it actually happens, `+0` means *now*, `+2` means in two seconds from now.

### Velocity [Number]

How loud the attack will be triggered (`0` = quiet, `1` = loud)

## Output

### Signal [Audio]

Can be connected to a dynamic audio param port, e.g. to the `Volume`-port of an `Lib.Tonejs.Oscillator`-op or a `Signal`-op.

### Envelope Object [Object]

Can be connected to an envelope-port of a synth