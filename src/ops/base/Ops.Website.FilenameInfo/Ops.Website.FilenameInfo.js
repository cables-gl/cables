const
    inUrl = op.inString("URL", ""),
    outProtocol = op.outString("Protocol"),
    outHost = op.outString("Host"),
    outFullPath = op.outString("Full Path"), // path without filename
    outFilename = op.outString("Filename"),
    outBasename = op.outString("basename"),
    outExt = op.outString("Suffix"),
    outIsURL = op.outString("Is URL"),
    outQuery = op.outString("queryParams");

op.toWorkPortsNeedsString(inUrl);

function isValidUrl(string)
{
    try { new URL(string); }
    catch (_) { return false; }

    return true;
}

inUrl.onChange = () =>
{
    const url = String(inUrl.get()).trim() || "";
    const isUrl = isValidUrl(url);
    outIsURL.set(isUrl);

    if (url.indexOf(":") > -1)
    {
        const pathArray = url.split(":");
        outProtocol.set(pathArray[0]);
    }
    else outProtocol.set("");

    if (outProtocol.get().startsWith("http"))
    {
        if (url.indexOf("/") > -1)
        {
            const hostArr = url.split("/");
            outHost.set(hostArr[2]);
        }
    }
    else outHost.set("");

    const hostArr = url.split("/");

    let filePart = hostArr[hostArr.length - 1];
    if (filePart.indexOf("?") > -1)
    {
        const parts = filePart.split("?");
        filePart = parts[0];

        outQuery.set(parts[1]);
    }
    else
    {
        outQuery.set("");
    }

    if (url.indexOf(".") > -1)
    {
        const fnArray = filePart.split(".");
        outExt.set(fnArray[fnArray.length - 1]);
    }
    else outExt.set("");

    if (url.indexOf("/") > -1)
    {
        if (outProtocol.get() != "data")
        {
            outFilename.set(filePart);
            outBasename.set(CABLES.basename(filePart));
        }
        if (outProtocol.get() == "data")
        {
            if (url.startsWith("data:text/plain"))outExt.set("txt");
            else
            {
                const a = url.split(":");
                if (a[0])
                {
                    const b = a[1].split("/");
                    if (b[1])
                    {
                        const c = b[1].split(";");
                        if (c[0])
                        {
                            const d = c[0].split(",");
                            if (d)outExt.set(d);
                        }
                    }
                }
            }
        }

        hostArr.length -= 1;
        let fullPath = hostArr.join("/");
        fullPath = fullPath.replace(outProtocol.get() + "://", "");

        if (outProtocol.get() != "data") outFullPath.set(fullPath);
    }
    else
    {
        outFullPath.set("");
        if (!isUrl)outFilename.set(url);
        outBasename.set(CABLES.basename(filePart));
    }

    if (!url)
    {
        outFilename.set("");
        outBasename.set("");
    }
};
