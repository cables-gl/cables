# Importing patches

Cables lets you create new patches from exported patches that are a ["Patch" export](../dev_embed/export_standalone/export_standalone).
This can be used to pick up work done in [cables standalone](/standalone) or be used as a way to back up different versions of one patch.

## Import

To import a patch, go to the [import tab](/mydata#import) in the "My Data" section on cables.gl and upload the Zip created during export or
manual backup. Once successfully uploaded the import will:

- Create a new patch with "imported:" prefixed to the name
- Copy all assets to the new directory and replace usages in ops of that patch
- Migrate all "non core ops" to [Patch Ops](../../5_1_permissions/3_ops/ops) and update the patch
- Show a link to open the new patch

You can now continue working on that patch. Be aware that this is a copy of the original patch, no changes made here will be reflected
in the original patch at all. 

All ops that belong to patches, users or teams have been renamed to patch ops of the new patch. If you
want to propagate changes made to an op of (e.g.) a team, simply [rename](../../5_writing_ops/dev_renaming/dev_renaming) the op (back) to a team-op. 
This might be a good time to create a [new version](../../5_writing_ops/dev_renaming/dev_renaming) of the op.
