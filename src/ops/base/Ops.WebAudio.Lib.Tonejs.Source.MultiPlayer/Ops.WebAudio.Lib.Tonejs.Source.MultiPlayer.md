# MultiPlayer

*Ops.WebAudio.Lib.Tonejs.Source.MultiPlayer*  

MultiPlayer is well suited for one-shots, multi-sampled instruments or any time you need to play a bunch of audio buffers. It has eight ports to which you can connect an `AudioBuffer` – which holds your sample (wav / mp3 / ogg). It also brings some options to change the pitch of each sample, or set its duration.

For every action (`Start Buffer` / `Start Buffer (Loop)` / `Stop Buffer` / `Stop All Buffers` ) you can specify the `Time` – `+0` means *right now*. By putting in a bigger number you can schedule things in the future, e.g. starting a sample with `Time` = `+3` will start the playback in three seconds. 

**Important: **When you trigger `Start Buffer` / `Start Buffer (Loop)` / `Stop Buffer` you also need to specify the `Buffer Index` – so which of the buffers you want to start / stop. By default this is `0`, so the first buffer will be used (`Audio Buffer 0`).

[Tone.js Reference](https://tonejs.github.io/docs/#MultiPlayer)

## Input

### Audio Buffer X [AudioBuffer]

Connect this to an `AudioBuffer`-op, which holds the audio-sample you want to use.

### Start Buffer [Function]

Starts the buffer at index `Buffer Index` at time `Time`, also uses `Offset` `Duration`, `Pitch`, `Gain`

### Buffer Index [Number]

The number of the buffer to start / stop

### Time [String]

When to start / stop a buffer – `+0` = *now*, `+3` = *in three seconds*

### Fade In Time [String]

How long it takes until the sample is at full volume

### Offset [String]

The offset into the buffer to play from, e.g. `0.1` skips the first 0.1 seconds

### Duration [String]

How long to play the buffer for, can be left empty

### Pitch [Number]

The interval to repitch the buffer, `-1` = *one semitone down*, `1` = *one semitones up*, `12` = *one octave up*

### Gain [Number]

The gain to play the sample at, `1` = *default*

### Start Buffer (Loop) [Function]

Same as `Start Buffer` but the playback will be looped. Starts the buffer at index `Buffer Index` at time `Time`, also uses `Offset` `Duration`, `Pitch`, `Gain`. Additionally you can specify `Loop Start` and `Loop End`

### Loop Start Time [String]

When to start the loop, can be left empty

### Loop End Time [String]

When to end the loop, can be left empty

### Stop Buffer [Function]

Stops the buffer at index `Buffer Index` at time `Time`. If this buffer is being played multiple times, only the first one will be stopped.

### Stop All Buffers [Function]

Stops all buffers at time `Time`, will not use `Fade Out Time`

### Fade Out Time [String]

How long it takes until the buffer is fully stopped when `Stop Buffer` was triggered

### Volume [Number]

The volume of the `MultiPlayer` in dB

### Mute [Bool]

Mutes the whole player

## Output

