This op will take an incoming texture and convert each color pixel value to an Array 4 (RGBA). 

When using 32bit textures your array values will be in the range of 0.0-1.0.
8bit textures will have values of 0-255.

Be careful with using high resolution textures. For example a texture of only 100x100 pixel will result in 40,000 values:
Red 10,000
Green 10,000
Blue 10,000
Alpha 10,000


