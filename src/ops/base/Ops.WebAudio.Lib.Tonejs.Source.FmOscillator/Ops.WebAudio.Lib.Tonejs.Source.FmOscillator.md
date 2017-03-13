# FmOscillator

*Ops.WebAudio.Lib.Tonejs.Source.FmOscillator*   

## Inputs

### Frequency [Number, Audio]

The oscillator's frequency

### Detune [Number, Audio]

How much it is detunes, `0` = not at all, `100` = one semitone up, `-100` = one semitone down, `12000` = one octave up

### Harmonicity [Number]

Harmonicity is the frequency ratio between the carrier and the modulator oscillators. A harmonicity of 1 gives both oscillators the same frequency. Harmonicity = 2 means a change of an octave.

### Type [String]

The type of the carrier oscillator, either `sine`, `square`, `triangle` or `sawtooth`

### Modulation Index [Number]

The modulation index which is in essence the depth or amount of the modulation. In other terms it is the ratio of the frequency of the modulating signal (mf) to the amplitude of the modulating signal (ma) -- as in ma/mf.

### Modulation Type [String]

The type of the modulation oscillator, either `sine`, `square`, `triangle` or `sawtooth`

### Phase [Number]

The phase of the oscillator in degrees (between `0` and `180`).

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