# cables Documentation / Gitbook

- Uses [Gitbook](https://github.com/GitbookIO/gitbook)
- All text written in [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet), a good editor is [Typora](https://typora.io/)

## How to add an article / tutorial

- Create a new file / folder in `content`, e.g. `/how-to-write-shader-ops/how-to-write-shader-ops.md`
- Write your text
- Include a link to your new article in `content/TABLE_OF_CONTENT.md`
- Generate the gitbook by running `npm run build` (be patient, that takes a bit)
- Run `git push`,  [docs.cables.gl](https://docs.cables.gl) will automatically update

## Using Images in an Article / Op Doc

- Create a folder `img` in your article / op documantation and place all article-relevant-images in there, e.g. `/how-to-write-shader-ops/img/shader.jpg`

## Installation

- `nvm use` – switch to node.js version specified in .nvmrc


- `npm install gitbook-cli -g` (see [gitbook docu ](https://github.com/GitbookIO/gitbook/blob/master/docs/setup.md))
- `gitbook fetch latest` – install the latest stable release
- `npm install`

## Build

- Run `npm run build` to generate op-doc and clean up after itself, the directory `_book` contains the static-html-pages then


### Build in Detail

- Copies all op-documentations with images from the `src` folder to the temp folder `ops`
- A script generates the op-summary with indentation for every namespace
- `content/TABLE_OF_CONTENT.md` defines the basic book structure, here you can add tutorials / articles
- In `_book` you can now start a http-server to view the book

## Rebuild on Server

- Using a webhook from Github we inform the cables-server on every commit to rebuild the docs
- The docs live in `/var/www/doc_cables`

## Testing

- To test changes to the doc call `npm run serve` and run the gitbook listener
- Gitbook serve URL: `http://localhost:4000`

## book.json

This is the config-file for the gitbook-documentation, where e.g. plugins are loaded.  
Make sure to have a newline on the end!

## GIFs / Screencaptures

- Gifs can be recorded e.g. with the free tool `GifGrabber`
- Keyboard Shortcuts can be shown with [keycastr](https://github.com/keycastr/keycastr)

## Problems / To-Do

- Currently non-unique namespace-parts lead to problems, e.g. `Ops.Math.Compare.xxx` will have a wrong indentation, because another namespace `Ops.Compare.xxx` exists

## Checking for broken links

- Install [broken-link-checker](https://github.com/stevenvachon/broken-link-checker):
  - `npm install broken-link-checker -g`
- Check with `blc https://docs.cables.gl -ro`
  - Error 401: Not logged in
  - Mozilla Web Audio Error: Can be ignored

## How to add the docs of an op - DEPRECATED

- All op-documentations are in the folder  `cables/src/ops/base/`, next to the op-code (JavaScript-file).
- If you want to add a documentation for an op, create a new markdown file in the op-folder, e.g. `cables/src/ops/base/Ops.Anim.Frequency/Ops.Anim.Frequency.md`
- When you are done writing the doc generate the gitbook by running `npm run build` (be patient, that takes a bit)
- Run `git push`  [docs.cables.gl](https://docs.cables.gl) will automatically update