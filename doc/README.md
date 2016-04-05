# cables Documentation / Gitbook

- Uses [Gitbook](https://github.com/GitbookIO/gitbook)
- Can produce `.pdf` and `.epub`-files
- The `ops`-folder currently contains a copy of the ops-documentation, because gitbook uses the same `.gitignore` file Github does, so we cannot ignore the `ops` folder for now… :/

## Installation

- `npm install gitbook-cli -g` (see [gitbook docu ](https://github.com/GitbookIO/gitbook/blob/master/docs/setup.md))
- `npm install`

## Build

- Run `npm run build` to generate op-doc and clean up after itself

- When everything looks good, build static files with `gitbook build`

## Testing

- To test changes to the doc call `npm run serve` and run the gitbook listener and `npm run ops` to re-generate the summary
- Call `npm run clean` afterwards to remove the temp-directory (`ops`)
- Gitbook serve URL: `http://localhost:4000`

## Editing the index-file (SUMMARY.md)

- `SUMMARY.md` will be partly generated (op-documentations will be added by a script), if you want to make changes to `SUMMARY.md`, you need to edit `SUMMARY_base.md`

## book.json

This is the config-file for the gitbook-documentation, where e.g. plugins are loaded.  
Make sure to have a newline on the end!

## Exporting PDF / Epub

>You must have the Calibre eBook reader/manager installed AND the command-line tools installed. To install the Calibre command-line tools from the Mac version, from the menu select: calibre - Preferences - Miscellaneous - Install command line tools