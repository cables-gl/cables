When working with a GLTF scene with lots of geometry objects you can use this operator to filter your entire GLTF scene for object names and create a collision mesh. 

For example if you created a model of a house, and then create a simplified set of objects representing the collision meshes for the walls and floors - name the simple collision meshes with a prefix like "Collision_" and then use this operator and put in the word "Collision" in the Filter Meshes paramter and just like that all of your many collision meshes will be considered as physics objects inside your cables project.


###Problems with rotations, wrong collision meshes?

Here is a tip about preparing GLTF scene geometry:
When using Blender or another software to prepare your GLTF scene for your cables physics simulations it is required you apply all of your transforms, scaling and rotations on your objects.

In Blender, you can simply select all objects with CTRL-A and click Apply All Transforms in the top menu.

