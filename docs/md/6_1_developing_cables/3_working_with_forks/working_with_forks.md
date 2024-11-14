# How to work with forks

It is a common workflow using git/GitHub to [create forks before you submit a pull request](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

This describes the steps needed to work with your fork of any of the cables repos.

You should first run through the [quick start](../README.md) to install the cables dev environment.

## Create a fork
- Create a fork on GitHub (e.g. for [cables_ui](https://github.com/cables-gl/cables_ui/fork))

## Changing to your remote
Pick the repo you forked, enter into it's directory, change the origin.

For `cables_ui`:
- Enter the `cables_ui` directory
    - `cd cables_ui`
- Update the repository to get the current state
    - `git pull`
- Store the default cables remote into a variable, for later use:
    - ``CABLES_ORIGIN=`git remote get-url origin` ``
- Set the URL of the default remote (`origin`) to your repo-url (change accordingly!)
    - `git remote set-url origin git@github.com:MYUSER/MY_PERSONAL_FORK_OF_CABLES_UI.git`
- Add a new remote `upstream` with the original cables repo url (from above)
    - `git remote add upstream $CABLES_ORIGIN`
- If you did not fork the repository on GitHub you may want to push the current state to your new remote
    - `git push -u origin`

## Sync with `upstream`, before pull-requests
- the `update_repos.sh` script will work on your remote, given this setup
- to update your repository with the changes made in `upstream` do:
    - `git rebase upstream develop` (change branch accordingly if needed)
