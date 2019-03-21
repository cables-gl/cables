
# cables API

you can access cables functionality via an API

to access the API you need to create an API key.

to create an API key goto your settings, select the tab "apikey" and click "create".

#### API endpoints

- `/api/mypatches` 
  a list of all your patches

- `/api/project/[PID]/export`
  create an export of a patch with the id PID
  the resulting json contains a field path. this is the download path for the exported zip file, relative to `https://cables.gl/`

  url query parameters:

  - `removeIndexHtml` - remove index.html from export
  - `jsonName` - filename of resulting json file 
  - `combineJS` - combine .js and json files into one

#### accessing the API via CURL

use this to test your apikey via command line:

`curl -H 'X-apikey: YOUR_API_KEY' 'http://cables.gl/api/mypatches'`

#### exporting cables projects

(cables command line exporter)[https://github.com/pandrr/cables-cli]




