# Convolver

*Ops.WebAudio.Convolver*  

The ConvolverNode interface is an AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a **reverb effect**.

For free impulse responses check out [Open AIR Library](http://www.openairlib.net/).

## Input

### Audio In

*Type: Object*  
The audio signal to apply the convolution on

### Impulse Response

*Type: Object*  
The audio file used for the convolution. Must use the same [sample rate](https://developer.mozilla.org/de/docs/Web/API/AudioContext/sampleRate) as the audio context (44100 in most cases).

### Normalize

*Type: Value [true, false], default: true*    
When set to true, the impulse response will be normalized. 

## Output

### Audio Out

*Type: Object*  
The convolver applied to the audio input