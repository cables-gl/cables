# Standalone - Commandline Options

Some behaviour of cables can be controlled or overridden using comandline options. Add
them when calling the executable from any shell

For all systems: Open a shell and change into the direcory containing cables standalone (App, AppImage or .exe)

## Windows

`cables.exe --fullscreen`

## MacOS

`open -a "cables" --args --fullscreen`

## Linux

`./cables.AppImage --fullscreen`

## Available commandline options

- `--help` List all options
- `--fullscreen` Open editor in fullscreen window on start
- `--maximize-renderer` Maximize the renderer to window size on start
- `--patch=<path>` Open patch from `.cables` file on start
- `--no-patch` Start with an empty patch, even if 'open last saved patch' is enabled in preferences.
- `--force-igpu` Force using integrated GPU when there are multiple GPUs available.
- `--dont-force-dgpu` DO NOT force using discrete GPU when there are multiple GPUs available.
- `--screen=external` Open cables on first external display
- `--screen="Built-in Retina Display` Open standalone on display named "Built-in Retina Display"
- `--screen=1` Open standalone on second display (numbering starts at 0)
- `--screen=200,200` Open standalone on current display 200px from the top left and 200px from the left
