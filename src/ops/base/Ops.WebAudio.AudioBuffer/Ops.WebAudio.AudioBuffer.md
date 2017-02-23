# AudioBuffer

*Ops.WebAudio.AudioBuffer*  

Stores an audio file / sample.   

WebAudio Node Reference: [AudioBuffer](https://developer.mozilla.org/de/docs/Web/API/AudioBuffer)



## Input

### URL [String]

The audio file to load. Mostly you will drag an audio file into the cables window and select it via the file-chooser in the op parameter view. Depending on the browser you use (or user who will see / hear your exported patch) only certain file types can be played back. MP3 seems to be the best supported audio format.

## Output

### Audio Buffer [Object]

The loaded audio buffer, can be connected to e.g. `AudioBufferPlayer`

### Finished Loading [Boolean]

`true` when the file is loaded

### Sample Rate [Number]

The sample rate of the sample in samples per second, of the PCM data stored in the buffer.

### Duration [Number]

Length of the buffer, in sample-frames, of the PCM data stored in the buffer.

### Number Of Channels [Number]

How many channels the audio file contains, `2` means stereo

