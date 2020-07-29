
# Working with files

You can drag files into the cables window to upload them.
Image and Audio files do not need to be converted.

Possible file types:

Image/Video: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.mp4`,
Audio: `.ogg`, `.mp3`, `.m4a`, `.aac`,`.wav`,



## File Converters

cables automatically converts files into a more readable web format which can then be read by the ops.

To convert a file upload it, then click it in the file browser. on the right you can see information about this file the converters are listed.



### automatic 3d file Format conversions:

`.obj`, `.fbx`, `.dae` files will be automatically converted to `.3d.json`

this is done using [assimp2json](https://github.com/acgessler/assimp2json)



### SVG to mesh

file ending: `.svg`

convert an svg file to a 2d mesh

### SVG path points

file ending: `.svg`

convert svg point array

### CSV to json

file ending: `.csv`

convert csv to json

### DAE line strips

file ending: `.dae`

extract paths/splines from .dar/collada files

### MIDI to json

file ending: `.mid`

converts midi to json

[example](https://cables.gl/op/Ops.Audio.MidiJson)

### Mesh sequence

file ending: `.seq.zip`

converts a sequence of obj files to a morphing animation

[example](https://cables.gl/op/Ops.Gl.MeshSequence)



