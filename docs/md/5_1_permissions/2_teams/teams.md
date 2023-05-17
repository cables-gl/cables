# Teams

Cables allows to create teams to share [ops](../3_ops/ops) and [patches](../1_patches/patches) with other users or the whole community.

Users can join a team by either being invited to it by other members, requesting access to the team or simply joining public teams on their own.

## Access-Level

### Non-Member

Any user that is not a member of a team already, can:

- View the teams page for unlisted and public teams
- See a list of public patches for unlisted and public teams
- See a list of the [ops](../3_ops/ops) provided by the team
- Join public teams
- Request access to unlisted teams

### Read-Only

Any team member with "Read Only" permissions adittionaly can:

- View the teams page with all public and private patches
- Use the [ops](../3_ops/ops) provided by the team in ALL their patches
- Request full access to the team
- Leave the team

### Full-Access

On top of the above, any team member with "Full Access" permissions can:

- Invite users to the team
- Remove users from the team
- Grant "Full Access" to members of the team
- Add [patches](../1_patches/patches) to the team
- Add and edit [team-ops](../3_ops/ops)
- Change the teams settings (logo, name, description, visibility, [op namespaces](../3_ops/ops), ...)

### Owner

Once you create a team on [cables.gl](https://cables.gl) you will become the owner of this team. 
As a team-owner you can:

- Delegate ownership of the team to some other member

## Visibility

Teams itself have three levels of visibility: "public", "unlisted" and "private".

Public teams will be:

- Listed on the [public teams page](/teams)
- Joinable by any registered cables user without approval by the team-owner (they will get "Read Only" access)
- Linked on the patch page for patches that added the team

Unlisted teams will be:

- Accessible to non-members that know the URL of the team
- Show a "Request Access" button on the team page
- Show only public patches to non-members on the team page
- Linked on the patch page for patches that added the team only for members

Private teams will be:

- Accessible only by members, invite people to add them to the team
- Linked on the patch page for patches that added the team only for members

## Sharing patches

To share [patches](../1_patches/patches) with a team, you need both "Full Access" on the patch and on the team.
Add the team on the "Collaboration" tab in the settings of the patch in question.

## Sharing ops

To share ops with a team, register a [op namespaces](../3_ops/ops) for your team in the teams settings (needs "Full Access") and create an op in this namespace in the editor.
If you have other [ops](../3_ops/ops) already and want to move them to the team, simply use the op rename feature to move them to a new namespace.
