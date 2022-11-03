# Transparent Canvas

to make a patch transparent, you have to:

1. in your mainloop op, disable "clear" and "clearAlpha"
2. you will see a checkerboard pattern in the editor and on the patchpage
3. exporting your patch will have all the settings for transparency set already
4. to avoid any flickering the background color in the export is set to black, remove that if not wanted (`color: #fff;`)
5. if you need to disable transparency when embedding, change this line in the patch constructor: `"canvas":{"alpha":false,"premultipliedAlpha":false}`

see a working example [here](https://github.com/cables-gl/cables-embedding/tree/master/example_transparent)


## iframe embed

an embedded cables iframe can't be transparent, you have to export the patch!
