# Noise

*Ops.WebAudio.Lib.Tonejs.Source.Noise*   

`Noise` is a noise generator. It uses looped noise buffers to save on performance. `Noise` supports the noise types: "pink", "white", and "brown". Read more about colors of noise on Wikipedia.

## Input

### Playback Rate [Number]

The playback rate of the noise. Affects the "frequency" of the noise.

### Type [String]

The type of the noise. Can be "white", "brown", or "pink".

### Volume [Number]

The volume of the output in decibels (between `-96` and `0`).

### Start [Function]

Starts the noise at `Start Time` (`+0` means now)

### Start Time [String]

The time when to start the noise, `+0` means now

### Stop [Function]

Stops the noise at `Stop Time` (`+0` means now)

### Stop Time [String]

The time when to stop the noise, `+0` means now

### Mute [Value]

Mutes the output.

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

### Audio Out [Audio]

The noise audio signal