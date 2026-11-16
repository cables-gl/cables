# Headless patches

You can run some cables patches on the commandline, in headless mode.
This will run the cables patch in the context and with the full permissions of
the current terminal-session.

As the headless runner has no WebGL, DOM or most of the things a browser comes with,
it's mostly usable for background tasks, servers or calculations.

See example usecases on the [Headless Examples Patchlist](https://cables.gl/patchlist/headless).

## Exporting

Select the "Headless" option in the export dialog. The resulting export will contain the patch,
a package.json file and a run.js.

You can also use [cables-cli](../0_cli/cli) to export a patch using `cables export -t headless`.

## Running

Open the directory in a terminal and run:

```sh
npm install
node run
```

## Ops

Just like in the standalone, you can use ops that have [NPM dependencies](../../5_writing_ops/dev_libraries/dev_libraries),
the needed packages will be installed during the `npm install` step above.

Check out the [Ops.Extension.Standalone](https://cables.gl/ops/Ops.Extension.Standalone) namespace for
a few examples of npm-usage.

## Prerequisites

- Any current version of node/npm
- A patch that does not use browser features like WebGL or WebGPU
