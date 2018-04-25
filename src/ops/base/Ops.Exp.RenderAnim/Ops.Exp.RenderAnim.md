good ffmpeg settings to create a mp4 from image sequence and music file:

`
ffmpeg -framerate 30 -i fertile.png_%d.png -i fertile.mp3 -vcodec libx264 -crf 15 -acodec copy fertilesound9.mp4
`

how to make a video work also on ios devices:

`
ffmpeg -framerate 30 -i loopDfast.png_%d.png -vcodec libx264 -profile:v main -crf 15 -pix_fmt yuv420p -x264-params ref=4 loopDfastIos.mp4
`