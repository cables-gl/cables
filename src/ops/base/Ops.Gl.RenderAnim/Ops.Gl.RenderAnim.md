good ffmpeg settings to create a mp4 from image sequence and music file:

`
ffmpeg -framerate 30 -i fertile.png_%d.png -i fertile.mp3 -vcodec libx264 -crf 15 -acodec copy fertilesound9.mp4
`

how to make a video work also on ios devices:

`
ffmpeg -framerate 30 -i loopDfast.png_%d.png -vcodec libx264 -profile:v main -crf 15 -pix_fmt yuv420p -x264-params ref=4 loopDfastIos.mp4
`
How to download all images at once :

Make sure to go to site settings and "allow" automatic downloads. This will allow you to download all of the image files in one go. Otherwise you'll be asked to confirm each files location :(