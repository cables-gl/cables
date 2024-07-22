# Repositories

cables development is spread across five git-repositories

## [cables_dev](https://github.com/cables-gl/cables_dev)

the current repository is the "root folder" for all cables development, it holds
documentation, helper scripts to set up your environment and keep it up to date.

it also contains shared code between the different projects and holds npm commands to run watchers
for file changes during development (see below).

## [cables](https://github.com/cables-gl/cables)

the cables repository holds all the core ops of cables, and everything that is needed
to run cables patches (in the editor, but also in exported patches).

## [cables_ui](https://github.com/cables-gl/cables_ui)

cables_ui contains all code that makes up the cables editor, the ui. everything that is needed
to work on patches on cables.gl and in cables standalone lives in this repository.

## [cables_electron](https://github.com/cables-gl/cables_electron)

the repository to bring all of the above together to have a running version of the cables ui
with the cables code and ops. runs (and builds/packs) an electron executable that can be
used to create patches locally, or develop on core and ui features on your local machine.

## [cables_extensionops](https://github.com/undev-studio/cables_extensionops)

a repository containing all the extensions on cables.gl that are not in the core. it is not
needed for local development but will give you a few more ops to work with.
