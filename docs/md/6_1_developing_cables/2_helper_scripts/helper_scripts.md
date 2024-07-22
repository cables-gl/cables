# Scripts

## build_all.sh

enters all repositories and runs `npm run build`

## install_local.sh

tries to guess your OS, installs dependencies, creates needed directories and files and copies
`cables_example.json` to `cables.json` if it does not exist

## update_repos.sh

reads the current nodeversion vom .nvmrc and walks the repositories,
pulls upstream changes and merges develop into the current branch, also rebuilds with npm if there
are changes in the remore repositories.

if given a branch, like `update_repos.sh develop` tries to switch all the repositories to that
branch before then merging develop and building.

if given `force` as a first parameter, like `update_repos.sh force`, will rebuild with npm,
even if there are no changes in git.

## update_ops.sh

* intended for community devenv only
* updates patchops/userops/teamops/extensionops
* repositories need to be checked out to cables/src/ops/users, cables/ops/teams, ...
* pulls `master` and `main` for all repositories
* runs `npm run opdocs` in cables_api to refresh caches

## update_live.sh

* intended for cables.gl only!
* makes sure wanted node version is installed
* makes sure all the repositories are on `master` branch
* pulls `master` for all repositories
* runs `npm` to build all the repositories
* on live: run `pm2 restart all` afterward!
