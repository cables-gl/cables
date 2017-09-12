# Limiter

*Ops.WebAudio.Lib.Tonejs.Component.Limiter*  

`Limiter` will limit the loudness of an incoming signal. It is composed of a ?`Compressor` with a fast attack and release. Limiters are commonly used to safeguard against signal clipping. Unlike a compressor, limiters do not provide smooth gain reduction and almost completely prevent additional gain above the threshold.

## Input

### Audio In [Audio]

The audio signal to apply the limiter to

### Threshold [Number]

The threshold of of the limiter

## Output

### Audio Out [Audio]

The audio signal withe applied limiter