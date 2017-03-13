# PwmOscillator

*Ops.WebAudio.Lib.Tonejs.Source.PwmOscillator*   

`PwmOscillator` modulates the width of a `PulseOscillator` at the `modulationFrequency`. This has the effect of continuously changing the timbre of the oscillator by altering the harmonics generated.

## Input

### Frequency [Number]

The frequency of the oscillator, can be either 

### Detune [Number]

The detune amount, `100` = one semitone up, `-100` = one semitone down, `1200` = one octave up

### Modulation Frequency [Number]

The modulation rate of the oscillator.

## Phase [Number]

The phase of the oscillator in degrees (between `0`and `180`.

### Sync Frequency [Bool]

When set the frequency is synced to the BPM (beats per minute). BPM can be set in the `Transport`-op.

### Start [Function]

Will start the oscillator at `Start Time` 

### Start Time [Number, String]

The time when the oscillator starts once `Start` is triggered. `+0` means now, so in the moment `Start` is triggered. 

There are multiple possibilities on how to use time, check [tone.js time docs](https://github.com/Tonejs/Tone.js/wiki/Time).

### Stop [Function]

### Stop Time [Number, String]

The time when the oscillator stops once `Stop` is triggered. `+0` means now, so in the moment `Stop` is triggered. 

There are multiple possibilities on how to use time, check [tone.js time docs](https://github.com/Tonejs/Tone.js/wiki/Time).

### Volume [Number]

The volume of the output in decibels (between `-96` and `0`).

### Mute [Function]

Mutes the output

## Output