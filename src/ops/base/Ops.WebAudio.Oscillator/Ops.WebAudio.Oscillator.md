# Oscillator

*Ops.WebAudio.Oscillator*

The Oscillator-op represents a periodic waveform, like a sine wave. It causes a given frequency of sine wave to be created – in effect, a constant tone.

## Input

### Type

*Type: Value*   
Type of the oscillator, either `sine`, `square`, `sawtooth` or `triangle`

### Frequency

*Type: Value*
Frequency of the oscillator in Hertz. If you want to produce a certain tone, you can look up its frequency [here](http://www.phy.mtu.edu/~suits/notefreqs.html). Try something between `30` (very low) and `7000` (very high).

## Output

### Audio Out

*Type: Object*   
Audio output which contains the generated sound, can be connected to the [AudioOutput](../Ops.WebAudio.Output/Ops.WebAudio.Output.md)-op e.g..