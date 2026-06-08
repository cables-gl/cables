Port of the KTX2Loader class of three.js

https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/KTX2Loader.js

Use [toktx](https://github.com/KhronosGroup/KTX-Software/releases) to generate textures, e.g.:

`toktx --2d --genmipmap  --target_type RGBA --t2 --encode uastc --clevel 5 --qlevel 255 --lower_left_maps_to_s0t0 --assign_oetf linear lala.ktx2 cables_2026224_095303.png`