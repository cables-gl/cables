# Ops

As with [patches](../1_patches/patches) there are several ways of adding new ops to [cables.gl](https://cables.gl) and using them
in your patches. There is also several ways of sharing code with the community. We think it's important that shared code is somehow
"stable" and updating code in ops does not lead to broken patches.

Before you start reading up on the different levels of permissions, check the general documentation on [coding ops](../../5_writing_ops/coding_ops).
Ops itself are sorted into namespaces that make up the first part of any op's name (i.e. `Ops.Gl.MainLoop` lives in the `Ops.Gl.` namespace).
There are a few special namespaces that are bound to permission. To move ops around, check the section on [renaming ops](../../5_writing_ops/dev_renaming).

Sorted by level of visibility to other users, these are the different types of ops and their namespaces in cables:

## Patch Ops - `Ops.Patch.`

Ops in this namespace are visible and usable by any collaborator to the patch and only available to this patch.
Use these ops for custom-code that you do not want to share or reuse in any other patch.

### Visibility
- These ops will appear in the op selection dialog ONLY for the current patch
- Only the current patch will have access to it's patch ops
- Cloning any patch with patch ops in it will COPY over the ops to be new patch ops of that clone

### Permissions
- Any collaborator to the patch will be able to use these ops
- Only users with "Full Access" to the patch will be able to edit the code of patch ops
- Once a user clones a patch, they will be able to edit the COPY of the op, the original will stay the same
- Only users with "Full Access" to the patch will be able to [rename](../../5_writing_ops/dev_renaming) the op

### Publishing patches
- Publishing patches with patch ops is fine and the preferred way to publish patches with custom code

## User Ops - `Ops.User.`

User ops are a way to reuse YOUR code in multiple of YOUR patches. Use them if you need to test things in a few patches. Most of the time it is
better to create a team and use their ops (will "pollute" your op selection less, better collaboration, ...)

### Visibility
- User ops are visible and usable to the user who created them in all patches they are collaborator in
- Cloned patches will need the authors of all used userops as collaborators to work

### Permissions
- Collaborators to any patch will have access to ALL the userops of ALL the collaborators
- Only the author of the op can edit the ops code
- Only the author of the op will be able to [rename](../../5_writing_ops/dev_renaming) the op

### Publishing patches
- Publising patches with userops is not possible as it would mean all the clones would need the author as a collaborator for them to work
- Convert your userops to patchops (use "clone op code") to publish patches
- This will also let you sleep better, as you can make changes to your userops without the fear of breaking patches that were cloned at one point

## Team Ops - `Ops.Team.`

With a team that you have "Full Access" to (or during creation) you can decide to claim a unique namespace for the team. This will be the place
that any teammember with "Full Access" can create ops in.

There are two major usecases for teamops. First, you can obviously use them to work on a project spanning across multiple (versions of) patches, or
having multiple people work on the code of these ops. Secondly you can group ops together that share a common theme, implement the same library functionality,
offer some simple solutions to common problems or just have all your custom "ops using arrays" in one place.

### Visibility
- The ops will be shown on the team page and can be [seen accordingly](../2_teams/teams)
- Members of the team will be able to use the ops in ALL their patches (so they can use the "library" without polluting the team-patches)
- In patches that do not yet use a teamop the op selection dialog will show a "load" button to see the ops of that team, to not pollute the op selection dialog

### Permissions
- Members of the team will be able to use the ops in ALL of their patches
- "Full Access" members will be able to edit the opcode or create new ops
- "Full Access" members will be able to [rename](../../5_writing_ops/dev_renaming) the team's ops

### Publishing patches
- Publishing patches with teamops is not allowed as every collaborator to the patch has to be a member of any team of which ops are used
- It cannot be guaranteed that all the teams are "joinable" and we do not want to spam the team-owner with access requests
- Move your teamops to patchops (using "clone op code") before publishing, this way your patch will be in a "stable" state and you can continue developing your teamops

#### Public Teams
- If your team is listed as "public", you WILL be able to publish a patch using teamops, people will have to join the team before opening the patch in the editor or cloning, though
- You are now own your own regarding not breaking clones of patches using your teamop by changing the code!

## Extension Ops - `Ops.Extension.`

Extensions are a way to add code to cables and make it available to ALL users of [cables.gl](https://cables.gl). They can be understood as packages of ops
that are mature and stable. If you feel your ops fall into this categoy [contact us on Discord](https://discord.gg/AGTarWv) and we will provide you with an
appropriate namespace.

Extensions are bound to [teams](../2_teams/teams) and responsibility of the code, it's quality and stability is entirely on the owner and the members of the
team. So before applying for an extension namespace, create a team, make it public, and [move](../../5_writing_ops/dev_renaming) your ops to the teams namespace.

### Visibility
- The ops will be shown on the [ops reference list](/ops/Ops.Extension)
- Your team will appear on the [public teams page](/teams)
- All users of cables will be able to use your ops in any of their patches
- In patches that do not yet use the extension the op selection dialog will show a "load" button to see the ops of that extension, to not pollute the op selection dialog

### Permissions
- Extensions are readonly, once they are published they can only be cloned to be edited
- Create a [new version](../../5_writing_ops/dev_renaming) if you need to improve or bugfix your extension ops

### Publishing patches
- Publishing patches using extension ops is fine

