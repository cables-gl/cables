# Meter

*Ops.WebAudio.Lib.Tonejs.Component.Meter*  

`Meter` gets the RMS of an input signal with some averaging applied. It can also get the raw value of the input signal.

## Input

### Audio In [Audio]

The audio signal to meter

### Type [String]

The type of the meter, either "level" or "signal". A "level" meter will return the volume level (rms) of the input signal and a "signal" meter will return the signal value of the input.

### Smoothing [Number]

The amount of carryover between the current and last frame. Only applied meter for "level" type.

## Output

### Audio Out [Audio]

The untouched input signal