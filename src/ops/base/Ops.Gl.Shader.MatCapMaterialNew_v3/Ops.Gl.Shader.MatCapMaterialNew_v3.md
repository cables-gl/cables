In 3D computer graphics, the appearance of an 3D object depends on several things:

the surface normals (which determine how the object is shaded);
the point from which the object is viewed;
the lighting setup (orientation and types of lights);
and how the surface reacts to that lighting (for example, how shiny it is).
MatCap (Material Capture, also known as LitSphere) are complete materials, including lighting and reflections, so you can add it to an object and not have any need for, well, lighting and reflections. MatCaps allows you to create a surface material and lighting environment simply by painting an object so that it looks like how you want your surface to appear. This opens up all sorts of interesting possibilities for non-photoreal image rendering.

The key to using a MatCap texture is that is is mapped to the object’s normals (which exist in relation to the camera) defining a color for every vertex normal direction relative to the camera, and your material is set to shadeless (because you don’t need lights to have any influence, as they are a part of the MatCap texture). So as the camera moves around the object, the reflections and highlights move around your object (as if the object were moving and not the camera). In other words, if your object were a sphere, no matter how you looked at it, it would look like the matcap sphere (reflections always in the same place, e.g.). But as your object takes non-spherical shapes, thus changing the normals, the material responds as if it were made of the complex material.

MatCap is most commonly used for sculpting, as it gives quick and useful feedback on how an objects shape is changing. It also works with rendering, to an extent (good when you need to do a quick show-off-your-model render and don’t have time to set up any complex lights or materials). It's very cheap, and looks great when the camera doesn't rotate.

Text taken from https://github.com/nidorx/matcaps

Be sure to check out the repository to find a huge archive of matcaps!

Use at your own risk :)