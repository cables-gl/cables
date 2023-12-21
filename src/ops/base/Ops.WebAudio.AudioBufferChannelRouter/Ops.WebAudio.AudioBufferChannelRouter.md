Routes audio input channels to different output channels by modifying the audiobuffer accordingly.

Uses [copyToChannel](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/copyToChannel) to copy/move data from one channel to another.

Output channel number can be an offset. This will, for example, move both stereo channels to output channel 3 and 4 if set to 2. 

Channel numbers are zero-based, ususal order is L, R, SL, SR, C, LFE, ... check your soundcard settings to see how hardware-outputs are mapped to channels.