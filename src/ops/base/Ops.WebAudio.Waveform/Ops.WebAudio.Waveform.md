# Waveform

Outputs the waveform of an audio file. 

## Inputs

### Audio Buffer [Object]

Connect this to an `AudioBuffer` -op, which loads and holds an audio sample

### Samples Per Pixel [Number]

Controls how detailled the waveform is, the smaller the value the more detail and the wider the output. 

## Output

### Spline Points [Array]

The single points of the Waveform, can be connected e.g. to a `SimpleSpline`-op.