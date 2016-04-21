# Gain

*Ops.WebAudio.Gain*

The `Gain`-op can be used to make an audio signal more silent.

>The GainNode interface represents a change in volume. It is an AudioNode audio-processing module that causes a given gain to be applied to the input data before its propagation to the output. A GainNode always has exactly one input and one output, both with the same number of channels.

## Input

### Audio In

*Type: Value*   
The audio signal you want to make more silent / louder, e.g. an [Oscillator](../Ops.WebAudio.Oscillator/Ops.WebAudio.Oscillator.md)

### Gain

*Type: Value*
Amount of gain to apply, `0` = not audible, `1` = output will be as loud as the input signal, everything bigger than `1` will make the audio signal louder.

## Output

### Audio Out

*Type: Object*   
Audio output which contains the the input signal with the gain applied, can be connected to the [AudioOutput](../Ops.WebAudio.Output/Ops.WebAudio.Output.md)-op e.g..