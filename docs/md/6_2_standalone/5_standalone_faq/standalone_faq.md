# Standalone - FAQ

## How can I run cables standalone in fullscreen/presentation mode?

To start cables standalone in fullscreen and/or open the renderer in fullscreen on start, use the following
command line arguments.

- `--fullscreen`        Open editor in fullscreen window on start
- `--maximize-renderer` Maximize the renderer to window size on start

Use `--help` for more info.

## How can I let cables standalone run on my internal GPU instead of the dedicated one?

If you need or want to run cables or patches on the internal GPU of your laptop instead of the dedicated one
(which is forced by default), there is two commandline arguments to control the behaviour:

- `--force-igpu`          Force using integrated GPU when there are multiple GPUs available.
- `--dont-force-dgpu`     DO NOT force using discrete GPU when there are multiple GPUs available.

Use `--help` for more info.


## Where can I find more information and tutorials to get started?

There are plenty of tutorial videos on our [YouTube channel](https://www.youtube.com/cables_gl), some cover specific standalone topics. Feel free to suggest
topics, if you think something is missing or subscribe to the channel to get notified once we add a new video.

## I am having issues playing videos in cables standalone

Most of the videos around should play fine. If you encounter error-messages containing "ffmpg" that video format is likely
not supported by cables, electron and/or your operating system. This then is an issue with proprietary video codecs, and
we cannot really do anything about that...sorry...

## I get weird results when using filenames or file system-paths across operating systems

As a general rule of thumb: Whenever cables uses files, it's using URLs. URLs of local files look like this:

`file:/home/cables/myfile.txt` or `file:/C:/Users/cables/myfile.txt`

Notice the forward slashes. To keep this OS-independent, whenever you deal with files, try to use file-url.
There are ops to convert [back](https://cables.gl/op/Ops.Extension.Standalone.Files.PathToFileUrl) and [forth](https://cables.gl/op/Ops.Extension.Standalone.Files.PathToFileUrl) between URLs and paths.

## Can I support the development of cables and the standalone version?

Most definitely, check out the general section on [supporting cables](../../faq/faq). Thank you!
