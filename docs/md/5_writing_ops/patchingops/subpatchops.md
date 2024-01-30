# Patching Ops / SubPatchOps

![Button](img/subpatchop.png)

you can create new ops from existing ops. We call those subpatch ops. You can recognize them by their border. for example: [ComposingGridOverlay](/op/Ops.Gl.Meshes.ComposingGridOverlay)

there are multiple ways to patch ops. you can use the "Patch a new op" item in the menu, or select multiple ops and find a button in the right panel to create an op from the selection.

namespaces do not only categorize and group operators, they also control who can access ops.

The outcome of this is a nested hierarchy how ops can use certain ops or not.

## Prerequisites

| Namespace Prefix |  |
| ----------- | --------- |
| Ops.Patch| Can contain any ops of the namespaces below |
| Ops.User| Can contain any ops of the namespaces below, but not from above |
| Ops.Team| Can contain any ops of the namespaces below, but not from above |
| Ops.Extension| Can contain any ops of the namespaces below, but not from above |
| Ops....| cables core ops, can only contain core ops |


