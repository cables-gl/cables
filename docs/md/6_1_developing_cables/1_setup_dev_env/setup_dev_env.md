# Set up local environment

This quick start will install the cables dev environment for you, and all that is needed to start making changes to cables.
The setup relies on the [bash shell](https://www.gnu.org/software/bash/), which should be present on osx and linux, and
we will install it on windows. You should be somewhat familiar with working with [nodejs](https://nodejs.org/), but we
will guide you as much as possible.

In these steps we will clone the cables default repositories, once that is done, you can start working with your fork,
if you created one.

The scripts included in these steps and this repository are described in a [separate document](../2_helper_scripts).

But let's get started:

## Mac/Linux
- install [git](https://github.com/git-guides/install-git)
- clone the [cables dev repository](https://github.com/cables-gl/cables_dev): `git clone git@github.com:cables-gl/cables_dev.git`
- change into the checked out directory (`cd cables_dev/`)
- continue [below](#common)

## Windows 10/11
- install and start [Visual Studio Code](https://code.visualstudio.com/download)
- install git (`Ctrl-Shift-G`, `Download Git for Windows`), download, install (make sure to install `Git Bash` as well), restart `Visual Studio Code`
- clone [this repository](https://github.com/cables-gl/cables_dev) from GitHub (`Ctrl-Shift-G`, `Clone Repository`, `Clone from GitHub`)
- open new terminal (``Ctrl-Shift-` ``), make sure it's `Git Bash`, not `PowerShell`
- make sure you have a profile file for your shell `touch ~/.bash_profile`
- continue [below](#common)

<a id="common"></a>
## Common
- install [Node Version Manager](https://github.com/nvm-sh/nvm#install--update-script)
- close and reopen your terminal, make sure nvm is installed properly, `nvm --version` should output some version number
- run `./install_local.sh`
    - this will:
        - install the required node version (and set it as default in `nvm`)
        - check out all needed repositories into subdirectories
        - `npm install` all dependencies
        - `npm run build` in all repositories
- IMPORTANT: make sure your current shell has the proper node version by running `node --version` before the next step
    - if not, open a new terminal before you start the server, and check again
- change directory to `cables_electron/`
- continue with the step on ["Using standalone to develop cables"](../5_standalone_as_devenv/standalone_as_devenv#dev)
- if you forked any of the above repos, check out [how to work with forks](../3_working_with_forks/working_with_forks)
