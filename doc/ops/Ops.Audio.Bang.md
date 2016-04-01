# Ops.Audio.Bang

Can be used e.g. to create a `flash`-effect on the first beat of a music track. Good combination with the op `Ops.Audio.BPMTap`, just connect `bpm` and the `beat1` port of `Ops.Audio.BPMTap` to `beat`, connect `exe` and you are ready to go to `bang`. On a `bang` the out-value will be the same as `startValue` and to the end of the beat interpolate towards `endValue`. You can also use different `easing`-methods.

## In Ports

### exe

Connect e.g. to the `trigger` port of `renderer` op. 

### beat

Typically connect this to the `beat1` port of `Ops.Audio.BPMTap`. Every time a new `beat` comes in, the `bang` will start.

### startValue

The value where the animation starts when a `beat` comes in.

### endValue

The value where the animation stops, typically towards the end of a beat.

### bpm

The bpm (beats per minute) e.g. of an audio track. Used to calculate the length of the animation. Bigger value = faster, slower value = slower.

### easing

Choose between different easing methods to alter the animation – `linear`, `smoothstep`, `smootherstep`

## Out Ports

### bang

The output of the animation, connect this e.g. to a `translate`-operator.