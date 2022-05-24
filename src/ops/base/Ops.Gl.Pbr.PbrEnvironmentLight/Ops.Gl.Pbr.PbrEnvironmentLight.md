This operator is your image based lighting setup for all Ops.Gl.Pbr.PbrMaterial operators that will be located under it in your scene stack. For the highest quality, you will be using RGBE format equirectangular textures as the lighting scene input for this operator.

When using PBR Material with this operator, you can ignore connecting the output ports as they are silently communicated to your materials that are under the Environment operator. You can of course experiment with inputting custom textures for your PBR Material.

You can import your own .HDRI equirectangular images into the cables editor and it will automatically generate an RGBE format texture for you to use. You will find the texture file in your files library after your HDRI has been processed.

You can also find some RGBE environment examples in the file library.

additional reading:
https://en.wikipedia.org/wiki/RGBE_image_format

and an HDRI library here:
https://polyhaven.com/hdris

PBR Environment also supports Parallax Correction, which can improve the look and feel of your scene by correcting how you see your reflected environment on your PBR Materials on your objects. When using this feature it is advised to first make sure to turn on your Helper and Transform Gizmos in the editor canvas to easily see where your Scene bounds are. Adjust the center, minimum and maximum values to fit the PBR Environment bounding box to your desired coverage.
To review how to hide and unhide Gizmos for transform and Op helpers, please refer to this page and search for transforms https://cables.gl/docs/0_howtouse/ui_walkthrough/ui_walkthrough