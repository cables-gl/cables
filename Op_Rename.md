# Op Rename

At some point we need to rename all ops and ports to get a consistent naming scheme, it will feel ugly and unfinished if we don’t.

In `Op_Rename.json` there is one object which describes all changes needed for all ops, and special changes for individual ops.

Also see [Developing Ops](doc/dev_ops/dev_ops.md) (Chapter Naming Conventions) for current conventions.

## Changes for all ops:

- Capitalize, e.g. `render` —> `Render`, most of the ops are lowercase right now, so this is needed for all ops.
**All changes to individual ops should be done first**, because `Op_Rename.json` lists the old names (e.g. `r` —> `Red`).

## Op_Rename.json

Some ops need a rename:

```javascript
{
    "op_name": "Ops.Gl.MouseWheel",
    "op_name_new": "Ops.Devices.Mouse.MouseWheel"
  }
```

Some ops need a port rename:

```javascript
{
    "op_name": "Ops.Gl.Meshes.Cone",
    "ports": [
      {
        "from": "slices",
        "to": "Segments"
      }
    ]
  }
``` 

## General Renames (for all ops)

- All mentions of port-type: `texture` need to be renamed to `Object`
- All ports with name `exe` need to be renamed to `Execute`