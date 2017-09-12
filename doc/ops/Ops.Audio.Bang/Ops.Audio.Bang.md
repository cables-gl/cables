# Bang

*Ops.Audio.Bang*  

Can be used e.g. to create a `flash`-effect on the first beat of a music track. Good combination with the op `Ops.Audio.BPMTap`, just connect `bpm` and the `beat1` port of `Ops.Audio.BPMTap` to `beat`, connect `exe` and you are ready to go to `bang`. On a `bang` the out-value will be the same as `startValue` and to the end of the beat interpolate towards `endValue`. You can also use different `easing`-methods.

## Input

### Execute

*Type: Function*  
Connect e.g. to the `trigger` port of `renderer` op. 

### Beat

*Type: Function*  
Typically connect this to the `beat1` port of `Ops.Audio.BPMTap`. Every time a new `beat` comes in, the `bang` will start.

### Start Value

*Type: Value*  
The value where the animation starts when a `beat` comes in.

### End Value

*Type: Value*  
The value where the animation stops, typically towards the end of a beat.

### BPM

*Type: Value*  
The bpm (beats per minute) e.g. of an audio track. Used to calculate the length of the animation. Bigger value = faster, slower value = slower.

### Easing

*Type: Value*  
Choose between different easing methods to alter the animation – `linear`, `smoothstep`, `smootherstep`

## Output

### Bang

*Type: Value*  
The output of the animation int the range [Start Value, End Value], connect this e.g. to a `translate`-operator.