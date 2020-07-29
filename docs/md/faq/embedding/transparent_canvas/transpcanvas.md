# Transparent Canvas

to make a patch transparent, you have to:

1. in your mainloop op, disable "clear" and "clearAlpha"
2. when embedding, put this line in the patch constructor: `"canvas":{"alpha":true,"premultipliedAlpha":true}`

see a working example [here](https://github.com/cables-gl/cables-embedding/tree/master/example_transparent) 


