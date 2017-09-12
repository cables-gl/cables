# BiquadFilter

*Ops.WebAudio.BiquadFilter*

The BiquadFilterNode represents a simple low-order filter. It can represent different kinds of filters, tone control devices, and graphic equalizers.

## Input

### Audio In

*Type: Object*   
The audio signal you want to apply the filter to, e.g. an [Oscillator](../Ops.WebAudio.Oscillator/Ops.WebAudio.Oscillator.md)

### Type

*Type: Value*  
Which type of filter, either `allpass`, `lowpass`, `highpass`, `bandpass`, `lowshelf`, `highshelf`, `peaking`or `notch`.

>- **Lowpass**: A lowpass filter allows frequencies below the cutoff frequency to pass through and attenuates frequencies above the cutoff. LOWPASS implements a standard second-order resonant lowpass filter with 12dB/octave rolloff.
- **Highpass**: A highpass filter is the opposite of a lowpass filter. Frequencies above the cutoff frequency are passed through, but frequencies below the cutoff are attenuated. HIGHPASS implements a standard second-order resonant highpass filter with 12dB/octave rolloff.
- **Bandpass**: A bandpass filter allows a range of frequencies to pass through and attenuates the frequencies below and above this frequency range. BANDPASS implements a second-order bandpass filter.
- **Lowshelf**: The lowshelf filter allows all frequencies through, but adds a boost (or attenuation) to the lower frequencies. LOWSHELF implements a second-order lowshelf filter.
- **Highshelf**: The highshelf filter is the opposite of the lowshelf filter and allows all frequencies through, but adds a boost to the higher frequencies. HIGHSHELF implements a second-order highshelf filter
- **Peaking**: The peaking filter allows all frequencies through, but adds a boost (or attenuation) to a range of frequencies.
- **Notch**: The notch filter (also known as a band-stop or band-rejection filter) is the opposite of a bandpass filter. It allows all frequencies through, except for a set of frequencies.
- **Allpass**: An allpass filter allows all frequencies through, but changes the phase relationship between the various frequencies. ALLPASS implements a second-order allpass filter
(from [smartjava.org](http://www.smartjava.org/content/exploring-html5-web-audio-api-filters))

### Frequency

*Type: Value*  
A frequency in the current filtering algorithm measured in hertz (Hz).

### Frequency

*Type: Value*  
A frequency in the current filtering algorithm measured in hertz (Hz).

### Detune

*Type: Value*  
Representing detuning of the frequency in [cents](https://en.wikipedia.org/wiki/Cent_(music)).

### Q

*Type: Value*  
Q-factor / quality-factor, see [Wikipedia](http://en.wikipedia.org/wiki/Q_factor)

### Gain

*Type: Value*  
How loud the audio output should be, `1` = normal (unchanged), `0` = not audible

## Output

### Audio Out

*Type: Object*   
Audio output which contains the the input signal with the filter applied, can be connected to the [AudioOutput](../Ops.WebAudio.Output/Ops.WebAudio.Output.md)-op e.g..