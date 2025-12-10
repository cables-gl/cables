This handy operator will let you debug your physics simulation and hitboxes/meshes.  One great use case is to check that your GLTF scene hitboxes are in the correct locations or to find the best setting for a convex hull triangle simplification parameter.

It is handy to use this operator in a setup where you can toggle the debug view or hide it since the wireframe rendering can become quite CPU intensive. You may also simply uncheck the Wireframe rendering view and use the AABB mode instead.

tip:
when using different camera settings, field of view, view scaling - make sure to place the debug renderer after the camera - so your graphics and physics debug rendering match correctly.