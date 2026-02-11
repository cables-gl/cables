const url = op.require("url");
const path = op.require("path");

const pathToFileURL = url ? url.pathToFileURL : null;

const inFileUrl = op.inString("Path");
const inFormat = op.inSwitch("Format", ["System", "Windows", "Posix"], "System");
const outUrl = op.outString("FileUrl");

inFormat.onChange =
    inFileUrl.onChange = () =>
    {
        op.setUiError("error", "");
        try
        {
            let filename = inFileUrl.get();
            if (url && filename)
            {
                if(filename.startsWith("file:")) {
                    outUrl.set(filename);
                }else{
                    if (!path.isAbsolute(filename))
                    {
                        const paths = op.patch.config.paths || {};
                        if (paths.patchPath)
                        {
                            filename = path.join(paths.patchPath, inFileUrl.get());
                        }
                    }
                    filename = path.resolve(filename);

                    const options = {};
                    if (inFormat.get() !== "System") options.windows = inFormat.get() === "Windows";
                    outUrl.set(pathToFileURL(filename, options).href);
                }

            }
            else
            {
                outUrl.set("");
            }
        }
        catch (e)
        {
            outUrl.set("");
            op.setUiError("error", e.message);
        }
    };
