# cables Documentation / Gitbook

- Uses [Gitbook](https://github.com/GitbookIO/gitbook)
- Can produce `.pdf` and `.epub`-files
- The `ops`-folder currently contains a copy of the ops-documentation, because gitbook uses the same `.gitignore` file Github does, so we cannot ignore the `ops` folder for now… :/
- If we use `gitbook build` we could delete the `ops` folder afterwards to prevent people from editing a copy of a op-doc

## Installation

- `npm install gitbook-cli -g` (see [gitbook docu ](https://github.com/GitbookIO/gitbook/blob/master/docs/setup.md))
- `npm install`
- Make symlink to `src/ops/base`: `ln -s /Users/tim/dev/repos/cables/src/ops/base ops_base`

## Build

- Run `gitbook serve` to start gitbook file-listener / server
- Run `npm run start` to generate op-docu
- Check `http://localhost:4000`
- When everything looks good, build static files with `gitbook build`