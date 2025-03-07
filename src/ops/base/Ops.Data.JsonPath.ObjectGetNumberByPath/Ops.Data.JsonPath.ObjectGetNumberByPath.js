const
    objectIn = op.inObject("Object"),
    pathIn = op.inString("Path"),
    resultOut = op.outNumber("Output"),
    foundOut = op.outBoolNum("Found");

objectIn.onChange = update;
pathIn.onChange = update;

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
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            let result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 1);
            }
            else if (typeof result !== "number")
            {
                const errorMsg = "element at path " + path + " is not a number";
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 1);
            }
            else
            {
                foundOut.set(true);
            }
            resultOut.set(result);
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
