# Renaming / Creating a new version

In cables all ops are sorted into namespaces that make up the first part of any op's name (i.e. `Ops.Gl.MainLoop` lives in the `Ops.Gl.` namespace).
There are a few special namespaces that are bound to permission or op visibility To move ops around or to create a new version, rename them.

## Renaming ops

You can access the op rename page via the op page ("view documentation" from the editor). If you have the proper permissions,
you will see a "manage op" section a bit down the page and a "rename" button. This will take you to a page with a form that
will guide you through the renaming process.

Renaming any op will update ALL the patches using that op to the new name (exceptions, see below).
There can be no two ops with the same name in the same namespace, there should be no "gap" in version numbers, there
are a few rules about valid opnames. The rename form should help with all of these constraints.

There are a few special namespaces, see their use:

### Permission namespaces

- Ops starting with `Ops.Patch.` are ...ops, check [here](../../5_1_permissions/3_ops/ops) for implications
- Ops starting with `Ops.User.` are ...ops, check [here](../../5_1_permissions/3_ops/ops) for implications
- Ops starting with `Ops.Team.` are ...ops, check [here](../../5_1_permissions/3_ops/ops) for implications
- Ops starting with `Ops.Extension.` are ...ops, check [here](../../5_1_permissions/3_ops/ops) for implications
  - renaming and op into an extension op will COPY the code, NOT update existing projects and make the op READ ONLY

### Special namespaces

- Any op that has `.Dev.` as any part of it's namespace will only be usable on [https://dev.cables.gl](dev.cables.gl)
- Any op that has `.Deprecated.` as any part of it's namespace will not be visible in new patches and show a warning in old ones

## Creating a new version

If you do not want to improve any of your ops but fear an update might not be backwards compatible, cables offers an easy
way to create a new version.

The op's version is kept in the name of the op: `Ops.Gl.Texture_v2` is a newer version of `Ops.Gl.Texture`. Whenever
cables sees that old versions of ops are used, it will show a hint and offer an update mechanism in the editor. Old versions
of ops will also not appear in the op selection dialog.

The basic workflow to create a new version of `Ops.Team.Cables.NeedsUpdate` would be this:

- Clone the code of `Ops.Team.Cables.NeedsUpdate` into any other op (preferably a [patchop](../../5_1_permissions/3_ops/ops), as this will be temporary), say `Ops.Patch.Patch_5711.NeedsUpdate`
- Make your changes, fixed and improvements to that op
- Rename `Ops.Patch.Patch_5711.NeedsUpdate` to `Ops.Team.Cables.NeedsUpdate_v2` (notice the _v2, cables will warn you about existing versions or "gaps" in the version number)
- Open any patch that uses the old version and press the "update" button
