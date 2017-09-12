# PannerAndVolume

*Ops.WebAudio.Lib.Tonejs.Component.PannerAndVolume*  

`PannerAndVolume` is a combination of a `Panner`-op and a `Volume`-op.

`Panner` is an equal power Left/Right Panner. `Panner` uses the StereoPannerNode when available. 

`Volume` sets the volume of an audio signal.

## Input

### Audio In [Audio]

The audio signal to pan

### Panning [Number]

Where the audio signal should be heard, `-1` = fully left, `0` = center, `1` = fully right

### Volume [Number]

How loud it should be (in dB)

## Output

### Audio Out [Audio]

The panned audio signal