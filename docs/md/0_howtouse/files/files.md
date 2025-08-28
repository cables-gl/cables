# Working with files

You can drag files into the cables editor window to upload them.
Many image and audio file formats are natively supported and do not require any conversion.
Those file formats that do need to be converted for best usage in a browser will be autoconverted by the editor.
Additionally, the editor also includes some handy manual operations from within the **Files** manager.

## Supported file types:

Image/Video: `.exr`, `.hdr`,`.png`, `.jpg`, `.jpeg`, `.webp`,`.webm`, `.svg`, `.mp4`,`.mpg`,`.m4a`,`.mkv`,`.mov`

Audio: `.ogg`, `.mp3`, `.aac`,`.wav`

Fonts: `.ttf`,`.woff`,`.woff2`,`.otf`

3D models: `.glb`, `.fbx`, `.dae`

MIDI: `.mid`



## File Converters & Operations

cables automatically converts files into a more readable web format which can then be read by the ops. You can also manually convert your files and apply operations to make your files smaller.

To manually convert a file, first upload it, then click to select it in the **Files** manager.  Available file operations are listed in the information panel that is displayed.



## Automatic conversions:

### Convert pointcloud

file ending: `.pc.txt`

will convert to `.json` on upload

### Convert to .FBX to .GLB scene

file ending: `.fbx`

files will be automatically converted to `.glb` gltf binary files. You can also manually convert an `.fbx` file if needed.

### Convert to HDRI to RGBE

file ending: `.hdr`

will convert to `.rgbe.png` on upload

### Fix width/height of SVG

file ending: `.svg`

will try to fix missing width/height attributes on upload

### CSV to json

file ending: `.csv`

convert csv to json

### XML to json

file ending: `.xml`

convert xml to json

### MIDI to json

file ending: `.mid`

converts midi to json

[example](https://cables.gl/op/Ops.Audio.MidiJson)

## Manual Operations:

### Compress .GLB 3D Scene to Draco .GLB scene

file ending:`.glb`

`.glb` 3d scene files can be automativally compressed using Draco compression. You'll need to then use the Draco library to use the compressed scene in your project. Check out our documentation and tutorial [here](https://cables.gl/op/Ops.Gl.GLTF.GltfDracoCompression).

### SVG path points

file ending: `.svg`

convert svg point array

### DAE line strips

file ending: `.dae`

extract paths/splines from .dar/collada files

### SDF Font 

file ending: `.ttf`

convert `.ttf` to an SDF font format which consists of a .png and a .json instruction file.

### image resizing and compression

file ending: `.png`, `.jpg`, `.jpeg`

You can manually apply some simple operations to your image textures such as resizing to next power of two, convert png to jpg, compress png, or convert to webp

