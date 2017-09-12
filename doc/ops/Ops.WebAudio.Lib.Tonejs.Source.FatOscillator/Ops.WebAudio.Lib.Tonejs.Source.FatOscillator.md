# FatOscillator

*Ops.WebAudio.Lib.Tonejs.Source.FatOscillator*   

Multiple oscillators spread around the same frequency 

## Input

### Frequency [Number, Audio]

The oscillator's frequency

### Detune [Number, Audio]

How much it is detunes, `0` = not at all, `100` = one semitone up, `-100` = one semitone down, `12000` = one octave up

### Type [String]

The type of the carrier oscillator, either `sine`, `square`, `triangle` or `sawtooth`

### Spread [Number]

The detune spread between the oscillators in cents. If "count" is set to 3 oscillators and the "spread" is set to 40, the three oscillators would be detuned like this: [-20, 0, 20] for a total detune spread of 40 cents.

### Count [Number]

The number of detuned oscillators

### Phase [Number]

The phase of the oscillator in degrees.

### Start [Function]

Starts the source at the specified time (`Start Time`). `+0` = now

### Start Time [String]

When `Start` is triggered this is the time it when it starts. `+0` = now

### Stop [Function]

Stops the source at the specified time (`Stop Time`). `+0` = now

### Stop Time [String]

When `Stop` is triggered this is the time it when it starts. `+0` = now

### Sync Frequency

Sync the signal to the Transport's bpm. Any changes to the transports bpm, will also affect the oscillators frequency.

### Volume [Number]

The volume in dB, between `-96` and `0`

### Mute [Bool]

Mutes the output

## Outputs

### Audio Out [Audio]

The audio signal

