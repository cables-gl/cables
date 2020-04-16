# cables
something something cables
.

how to behave: https://github.com/pandrr/cables/wiki/Checklist---Creating-new-ops---A-new-op-version---how-to-changelog

how to don't get binary merge conflicts:
`git config --global merge.ours.driver true`


### docs

#### build gitbook doc:

```
cd doc/gitbook/
npx gitbook build
```
static html outut: _book/

#### build jsdoc

```
cd doc/jsdoc/
npx documentation build ../../../cables/src/core/index.js -f html -o out --theme theme
```
static html outut: out/
