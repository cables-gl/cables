# AudioBufferPlayer

*Ops.WebAudio.AudioBufferPlayer*  

Plays back audio data stored in an `AudioBuffer` (typically from an audio file). In contrast to the [Web Audio AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode), which can only play back an AudioBuffer once, this op can play back multiple times (every time the playback finished a new `AudioBufferSourceNode` is being created internally).  

## Input



## Output

### Audio Buffer [Object]

The audio buffer (typically from an audio file) which contains the audio data. In most cases you need to create a `AudioBuffer` op to load your audio sample and connect it to this port.

### Start / Stop [Bool]

When set the playback is started

### Start Time [Number]

The time in seconds when the sound should begin to play (once `Start / Stop` has been set to `true`). A time of `0` means *play now*, 

### Stop Time [Number]

The time in seconds when the sound should stop to play (once `Start / Stop` has been set to `false`). A time of `0` means *stop now*.

### Autoplay [Bool]

When set to `true` the sound will start to play as soon as the `AudioBuffer` is loaded.

### Autoplay [Loop]

Weather or not the playback should start from the beginning once the end has been reached. Please note that some browsers have problems doing a perfect loop with certain file types. If you e.g. use an MP3-file as `AudioBuffer` Google Chrome might produce a slight gap between the loops. Ogg-files sometimes work better.

### Detune [Number]

How much the sound should be detuned in [cents](https://en.wikipedia.org/wiki/Cent_(music)). `-100` means one semitone lower, `100` one semitone higher, `12000` is one octave higher (`12 * 100`).

### Playback Rate [Number]

How fast / slow the audio should be played back, `1` is normal speed, `2` double speed, `0.5` half speed.