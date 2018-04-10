good ffmpeg settings to create a mp4 from image sequence and music file:

`
ffmpeg -framerate 60 -i fertile.png_%d.png -i fertile.mp3 -vcodec libx264 -crf 15 -acodec copy fertilesound9.mp4
`