Draw all vertices as points / circles. Combine this op with pointCloudFromArray to draw point clouds with a xyz array.

## Atlas
Atlas Feature lets the user use Textures that contain multiple Images. 
The Images must be the same size and be arranged on the x axis.
The atlas texture input will be used as an index texture. every pixel is the index of the atlas to be used.
0 is fist image, 1 is second image and so on.
When using the Cross fade toggle, those images will be mixed: 0.5 is a 50% mix of the first and second image.