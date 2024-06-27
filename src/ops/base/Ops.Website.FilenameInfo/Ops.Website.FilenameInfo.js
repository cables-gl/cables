const
    inUrl = op.inString("URL", ""),
    outProtocol = op.outString("Protocol"),
    outHost = op.outString("Host"),
    outFullPath = op.outString("Full Path"),
    outFilename = op.outString("Filename"),
    outBasename = op.outString("basename"),
    outExt = op.outString("Suffix"),
    outIsURL = op.outString("Is URL"),
    outQuery = op.outString("queryParams");

function isValidUrl(string)
{
    try { new URL(string); }
    catch (_) { return false; }

    return true;
}

inUrl.onChange = () =>
{
    const url = inUrl.get();
    const isUrl = isValidUrl(url);
    outIsURL.set(isUrl);
    if (!url) return;

    if (url.indexOf(":") > -1)
    {
        const pathArray = url.split(":");
        outProtocol.set(pathArray[0]);
    }

    if (url.indexOf("/") > -1)
    {
        const hostArr = url.split("/");
        outHost.set(hostArr[2]);
    }

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
        outFilename.set(filePart);

        outBasename.set(CABLES.basename(filePart));

        hostArr.length -= 1;
        const fullPath = hostArr.join("/");
        outFullPath.set(fullPath);
    }
    else
    {
        if (!isUrl)outFilename.set(url);
    }
};
