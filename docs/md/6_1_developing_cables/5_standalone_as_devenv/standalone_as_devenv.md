# Using standalone to develop cables

## Set Up

* the preferred way of developing cables locally is using the `cables_dev` repository: https://github.com/cables-gl/cables_dev
* that repo contains scripts that will set up everything for you to get started
* Read up about setting up everything for you to start contributing to cables in the section on how to ["Set up local environment"](../1_setup_dev_env/setup_dev_env)
  of the official cables documentation.

<a id="dev"></a>
## Build / Dev

Once the above steps are done, continue below, deciding beforehand if you want to improve your local version of cables standalone,
develop on cables core or editor, or would like to build and package a finished executable.

### Local Build

- set up your local environment (see above)
- change to `cables_electron` directory (`cd cables_electron`)
- run `npm install --no-save`
- run `npm run build` to build the standalone version
- run `npm run start` to start the standalone from the checked out sources

### Local Development

- set up your local environment (see above)
- change to `cables_electron` directory (`cd cables_electron`)
- run `npm install --no-save`
- run `npm run build`
- use `npm run start` to start the app
    - this will start watchers for changes in client-side javascript dirs (e.g. `src_client` and `../shared/client/`
    - when making changes to files in these directories, a reload of the electron app is enough to see the changes (Cmd/Ctrl+R)
- if you want to develop on ops and/or the ui, change to cables_dev (`cd ..`) and run `npm run watch:standalone`
    - this will create watchers on files in `cables` and `cables_ui` that trigger a rebuild on change
    - when making changes to files in these directories, a reload of the electron app is enough to see the changes (Cmd/Ctrl+R)

### Building an executable

- take the steps that are described in "Local Build" above
- use `npm run pack` or `npm run dist` (will try to sign the exe)  - add `:mac`, `:win`, `:linux` to only build one architecture
- find the executable in `dist/`
