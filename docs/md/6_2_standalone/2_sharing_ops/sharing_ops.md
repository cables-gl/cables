# Sharing ops

The simplest way of sharing ops is to just share the op directory with people. Package things into subdirectories
that have the op-name, make sure it has a reasonably unique name, delete the [node_modules](../3_using_npm/using_npm)-folder
if needed  and publish the directory however you want. Other people can then download the directory and add it to their projects
as shown above.

### Op packages

If you want to share a set of Ops with other people on the internet, you can create an op-package. This package
adheres to the `package.json` standard that npm uses and can be installed via `npm install`.

Make sure your `package.json` lists all the needed files in the `files` section and your way of distributing these
ops is compatible with [npm install](https://docs.npmjs.com/cli/v10/commands/npm-install#description).

A simple example:
```json
{
  "name": "Ops.Extension.Standalone.Net.Osc",
  "version": "0.0.1",
  "files": [
    "Ops.Extension.Standalone.Net.Osc.json",
    "Ops.Extension.Standalone.Net.Osc.js",
    "Ops.Extension.Standalone.Net.Osc.md"
  ]
}
```
