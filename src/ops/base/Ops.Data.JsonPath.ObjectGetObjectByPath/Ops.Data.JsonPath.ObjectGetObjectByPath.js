const
    objectIn = op.inObject("Object"),
    pathIn = op.inString("Path"),
    resultOut = op.outObject("Output"),
    foundOut = op.outBoolNum("Found");

objectIn.onChange = pathIn.onChange = update;
op.toWorkPortsNeedToBeLinked(objectIn);
op.toWorkPortsNeedsString(pathIn);
pathIn.setUiAttribs({ "stringTrim": true });

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    op.setUiError("notiterable", null);

    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not traversable by path");
        }
        else
        {
            op.setUiAttrib({ "extendTitle": path });
            let result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 1);
            }
            else if (Array.isArray(result) || result === null || typeof result !== "object")
            {
                const errorMsg = "element at path " + path + " is not an object";
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 1);
            }
            else
            {
                foundOut.set(true);
            }
            resultOut.setRef(result);
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}
