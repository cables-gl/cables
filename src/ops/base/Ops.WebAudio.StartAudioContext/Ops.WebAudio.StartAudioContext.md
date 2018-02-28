# StartAudioContext

*Ops.WebAudio.StartAudioContext*

On iOS you cannot play a sound unless the playback was initiated by a user interaction (touch).
Using this op the first touch on one of the selectors (the whole patch per default) starts the audio context and therefore allows you to play sounds on iOS.

Uses [github.com/tambien/StartAudioContext](https://github.com/tambien/StartAudioContext) by Yotam Mann.

## Input

### Selectors [String]

Selectors of the HTML DOM elements which start the audio context (separated by spaced, e.g. '#myButton .otherButtons'). Per default this is the whole patch – `#glcanvas`.

## Output

### Is Ready [Boolean]

Once the audio context has been started (and it is therefore save to play sounds) this becomes `true`