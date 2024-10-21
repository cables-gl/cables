Cast Ray allows you to pick 3d objects that are defined in your physics world (Ops.Physics.World).

One use case may be a 3D menu, where your buttons are cube meshes with physics cubes (Ops.Physics.Body.PhysicsCube_v2) placed in the same exact location. 
With Cast Ray placed in your physics world, you will be able to test when a mouse cursor intersects with one of the cubes, allowing you to use the cube as a button.

When using a Mouse OP with CastRay to pick your physics objects, make sure to directly plug in your Mouse op X/Y into the CastRay op and turn on Normalize in the Mouse OP.