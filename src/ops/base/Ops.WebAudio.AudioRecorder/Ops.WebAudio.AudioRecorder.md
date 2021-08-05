This op let's you record any webaudio stream in your patch.

How to use:

1. Connect audio to the input
2. Click/Trigger "Start Recording"
3. Record as long as you want
4. Click/Trigger "Stop Recording"
5. The recorded audio will be processed
6. To playback the recorded loop, connect the "Recorded Out" output and click "Start Playback"
7. To download, click "Download .wav file"
8. To stop playback, click "Stop Playback"
9. If you want to delete what you recorded, press "Clear Buffer"

The AudioRecorder has 5 states:

"idling" - there is nothing in the recording buffer, nothing is playing back
"recording" - the recorder is currently recording
"processing" - the recorder is currently processing the recorded audio
"ready" - the recorder is ready to play back/download
"playing"  - the recorder is currently playing back the recorded audio

