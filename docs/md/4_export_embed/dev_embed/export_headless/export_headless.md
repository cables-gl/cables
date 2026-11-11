# Export to run headless patches

You can run some patches on the cables commandline, in headless mode.
This will run the cables patch in the context and with the full permissions of
the current terminal-session.

As the headless runner has no WebGGL, DOM or most of the things a browser comes
with it's mostly usable for background tasks, servers or calculations.
See example usecases on the [Headless Examples Patchlist](https://cables.gl/patchlist/headless).

## Exporting

Select the "Headless" option in the export dialog. The resulting export will contain the patch,
a package.json file and a run.js.

Unzip the download, open the directory in a terminal and run:

```sh
npm install
node run
```

## Prerequisites

- Any current version of node/npm
- A patch that does not use browser features like WebGL or WebGPU
