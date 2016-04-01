# Convolver

*Ops.WebAudio.Convolver*  

The ConvolverNode interface is an AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a **reverb effect**.

For free impulse responses check out [Open AIR Library](http://www.openairlib.net/).

## Ports

### Input

#### audio in

The audio signal to apply the convolution on

#### impulse response

The audio file used for the convolution. Must use the same [sample rate](https://developer.mozilla.org/de/docs/Web/API/AudioContext/sampleRate) as the audio context (44100 in most cases).

#### normalize

When set to true, the impulse response will be normalized.  [default = true]

### Output

#### audio out

The convolver applied to the audio input