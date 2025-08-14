const
    objectIn = op.inObject("Object"),
    pathIn = op.inString("Path"),
    returnPathIn = op.inBool("Output path if missing", false),
    resultOut = op.outString("Output"),
    foundOut = op.outBoolNum("Found");

objectIn.ignoreValueSerialize = true;
op.toWorkPortsNeedToBeLinked(objectIn);

objectIn.onChange =
    pathIn.onChange =
    returnPathIn.onChange = update;

op.toWorkPortsNeedsString(pathIn);
pathIn.setUiAttribs({ "stringTrim": true });

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);

    let found = false;
    let result = "";
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not traversable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            result = data[path];
            op.setUiAttrib({ "extendTitle": path });
            if (result === undefined || result === null) result = resolve(path, data);

            const isNull = result === undefined || result === null;
            if (isNull)
            {
                const errorMsg = "could not find element at path " + path;
                result = "";
                if (returnPathIn.get())
                {
                    result = path;
                }
                op.setUiError("missing", errorMsg, 0);
            }
            else
            {
                result = String(result);
            }
        }
    }
    resultOut.set(result);
    foundOut.set(found);
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}
