# Analyser

*Ops.WebAudio.Lib.Tonejs.Component.Analyser*    

Tone.js wrapper around the native Web Audio's [**AnalyserNode**](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode). Extracts FFT or Waveform data from the incoming signal. Can be used to visualise sound.

## Input

### Audio In [Audio]

The audio signal you want to analyse

### Refresh [Function]

Does the analysis, mostly you want to connect this to `MainLoop`.

### Size [Number]

The size of analysis.

### Type [String]

The analysis function to use, either "fft" or "waveform".

### Smoothing [Number]

`0` represents no time averaging with the last analysis frame. If your want smoother values increase it.

### Max Decibels [Number]

The largest decibel value which is analysed by the FFT.

### Min Decibels [Number]

The smallest decibel value which is analysed by the FFT.

### Return Type [String]

The data type of the elements in the array, either `byte` or `float`

## Output

### Audio Out [Audio]

The same audio signal as in `Audio In` (pass through).

### Analyser Array [Array]

The array containing the audio analysis data.