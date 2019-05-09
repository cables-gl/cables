This op needs to be a child of an Image compose op. It is advised to turn off use Viewport size with the image compose and to make a smaller texture with user defined values.

Enable HDR on the image compose to get floating point outputs from the arrays.
Otherwise the array out will have values of 0-255 instead of 0.0 to 1.0 

Be careful with using high resolutions. Setting image compose to 100 x 100 will already result in an array length of 40,000
Red 10,000
Green 10,000
Blue 10,000
Alpha 10,000

The array out will have the format of RGBA.
To extract one color part of the array use the ArrayUnpack4 op.
