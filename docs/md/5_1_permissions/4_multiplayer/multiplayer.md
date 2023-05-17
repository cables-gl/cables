# Multiplayer

Cables offers the possibility to simultaneously work on patches, using the multiplayer feature.

Users that have at least "Read Only" access to the patch, through [collaboration](../1_patches/patches) or [teams](../2_teams/teams), can join a multiplayer session in any patch.

There are currently three levels of access in a multiplayer session, only the "Pilot" can make changes seen by all other "Participants"

## Non-Participant

If you are in a patch and there is a multiplayer-session going on, you can continue editing the patch (given you have the proper permissions) or you can:

- see who is currently in your patch, either in a session or as a non-participant
- join the multiplayer-session and become a participant
- start a multiplayer-session if none exists, yet
- chat with other people in the patch (i.e. to start a multiplayer-session)

## Participant

Once you join a multiplayer session, you will become a "Participant". As such you can:

- see the cursors of all participants in the session
- see area-marking of all participants in the session
- follow the changes of the pilot, see updates in selected ops, parameter changes and the renderer
- request the "pilot seat"
- re-sync your patch with the state of the pilot, if it went out of sync
- leave the session

## Pilot

Starting a multiplayer-session will make you the "Pilot". If you join a session later, you can request the pilot-seat to make changes
to the patch.

As a pilot you are able to:

- add and select ops and make changes to the parameters
- navigate the patch (pan, drag, go into subpatches, ...) and participants will follow you
- accept or decline requests for the pilot seat (requests will be automatically accepted after 20 seconds to prevent lock-outs with people going "afk")
- revert the patch (for everyone) to the last saved state
