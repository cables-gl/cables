# MediaPlayer

*Ops.WebAudio.MediaPlayer*  

Plays an audio-file and allows you to seek / jump to a position. Audio files can be uploaded via drag’n’dropping to the cables-window. When upload is complete you can select it in the project-file-browser. Should also work with audio-files which are hosted somewhere else (untested).

## Input

### Volume

*Type: Value*   
Playback-Volume, `1.0` = normal, `0.0` = silent  

### File

*Type: Value*   
The audio-file to play back, upload one by drag’n’dropping it to the window and then select if from the project-files or pick one from the library.

### Play

*Type: Function*   
Starts the audio-playback

### Pause

*Type: Function*   
Stops the audio-playback

### Rewind

*Type: Function*   
Sets the playhead to the beginning

### Seek Position (Seconds)

*Type: Value*   
Set this to the position in the audio file you want to jump to (in seconds). You need to call `Jump To Seek Position` to actually perform the jump afterwards.

### Jump To Seek Position

*Type: Function*   
Jumps / Seeks to the position `Seek Position (Seconds)`

## Output

### Audio Out

*Type: Object*   
Connect this to a `Ops.WebAudio.Output`-op to hear the sound

### Duration

*Type: Value*   
The duration of the current audio file (in seconds)ss

