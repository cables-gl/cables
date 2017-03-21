# DuoSynth

*Ops.WebAudio.Lib.Tonejs.Instrument.DuoSynth*  

`DuoSynth` is a monophonic synth composed of two `MonoSynths` run in parallel with control over the frequency ratio between the two voices and vibrato effect.

## Inputs

### Frequency [Number]

The frequency control

### Vibrato Amount [Number]

The amount of vibrato

### Vibrato Rate [Number]

The vibrato frequency

### Harmonicity [Number]

Harmonicity is the ratio between the two voices. A harmonicity of 1 is no change. Harmonicity = 2 means a change of an octave.

### Portamento [Number]

The glide time between notes.

### MonoSynth 1 [MonoSynth]

The first voice, must be a `MonoSynth`-op

### MonoSynth 2 [MonoSynth]

The second voice, must be a `MonoSynth`-op

### Volume [Number]

The volume of the output in decibels.

## Outputs

### Audio Out [Audio]

The audio output