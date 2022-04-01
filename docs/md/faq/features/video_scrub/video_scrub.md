# Video playback in cables
## Why is my video file not scrubbing, playing smoothly
If you have jerky video playback as you scrub (seek) or control the timing of your video with the [Video Texture Operator](https://cables.gl/op/Ops.Gl.Textures.VideoTexture_v2), make sure your video is encoded in the optimal codec and settings for the effect you are after.
You may have to try a few different settings when encoding your video but for most devices and browsers using H.264 video codec with a high frequency of Keyframes (i-frames) for the length of the video will get you nice and smooth results.
