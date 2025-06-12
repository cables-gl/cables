# Import and Backups

Cables lets you create new patches from previously downloaded patches that have been [exported in full](../dev_embed/export_standalone/export_standalone).
This can be used to pick up work done in [cables standalone](/standalone) or be used as a way to back up different versions of one patch.

If you [support cables](/support) as a patreon, all the membership levels come with some backup space on our machines. Cables will then also
periodically backup the current version of your patch and give you the option to restore this version to a new patch.

## Import

To import a patch, go to the [import tab](/mydata#import) in the "My Data" section on cables.gl and upload the Zip created during export or
manual backup. Once successfully uploaded the import will:

- Create a new patch with "imported:" prefixed to the name
- Copy all assets to the new directory and replace usages in ops of that patch
- Migrate all "non core ops" to [Patch Ops](../../5_1_permissions/3_ops/ops) and update the patch
- Show a link to open the new patch

You can now continue working on that patch. Be aware that this is a copy of the original patch, no changes made here will be reflected
in the original patch at all. All ops that belong to patches, users or teams have been renamed to patch ops of the new patch. If you
want to propagate changes made to an op of (e.g.) a team, simply [rename](../../5_writing_ops/dev_renaming/dev_renaming) the op (back) to a team-op. 
This might be a good time to create a [new version](../../5_writing_ops/dev_renaming/dev_renaming) of the op.

## Backups

Exporting and importing patches can be used as a simple way to create backups of different versions of a patch. The format of cables
backups is exactly the same as the ["Patch" export option](../dev_embed/export_standalone/export_standalone). Any export of that type can be treated as a backup of the patch.

Backups thus contain all assets of the patch, used or unused, all ["custom ops"](../../5_1_permissions/3_ops/ops) and all
the subpatchops **at the time of creation of the backup**.

### Manual Backups

To create and download a manual backup of your patch, all the ops and all the assets, click on "Create Backup" in the editor.
Depending on your [supporter level](/support) you will be guided to the [patch export page](../dev_embed/export_standalone/export_standalone)
or be able to give your backup a name. Once the backup was created you can store it on your local system and restore it
as described in the above section.

![](img/create_backup.png)

For supporters of cables creating a backup will add it to their list of backups available from the "Backup" navigation point
in the editor and can be restored (and downloaded) from there as well:

![](img/manage_backups.png)

### Automatic Backups

Cables will create automatic backups for you as long as you are not out of backup space, depending on your [supporter level](/support).

Automatic backups **ARE** created:

- before every export
- on loading of the patch
  - if there was a save after the last backup
  - **AND** the last backup is older than 30 minutes

Automatic backups are **NOT** created:

- if you exceeded your storage space limit
- the patch contains no ops

To not automatically push you over your storage limit, **all automatic backups are rolling backups**. 
There will be no more than 20 automatic backup versions per patch. Cables will delete the oldest backup of that patch when creating the 20th
backup. We will **never** automatically delete any manually created backups!

To prevent any automatically created backup from deletion, you can "Keep this backup" in the list of backups:

![](img/keep_backup.png)

**All backups, manual and automatic, are deleted when you delete the patch!**

### Restoring / Managing Backups

To restore a backup that you downloaded, you can simply import the backup as described above. For any automatic or manual
backups created on cables.gl you can select "Restore to new patch" from the list of backups. Doing this will create a new
patch with the same rules applied as described for imports above.

You can manage the backups of all your patches via ["My Data"](/mydata#backups) from the cables.gl menu. This page will give you an overview
of your currently used storage space, your current limits and let you delete/clean up backups that are not needed anymore...
freeing up space for more.

