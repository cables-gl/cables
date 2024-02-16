A performant way to render a 3d object many times.

Data like position, scaling, colors etc. are delivered as RGB channels in textures. 
RGB values represent XYZ coordinates in the position or scale input texture. Make sure the texture format has the required precision (16 bit or 32bit textures are a probably a must)

The 3d object or mesh to be rendered needs to be connected as a geometry. Most meshes in cables output a geometry object that you can connect. Imported 3d meshes can also output geometries, e.g. see GltfGeometry operator.

The object can be scaled differently each time, or have a different color, etc.

The Billboarding option will render the object always perpendicular to the screen.
Spherical billboarding means the object will be oriented flat to the screen, this is handy for 2d overlays.
Cylindrical billboarding can be used for instancing flat objects in a 3d environment, often used in games for rendering trees, grass or bushes as 2d planes.