const
    objectIn = op.inObject("Object"),
    pathIn = op.inString("Path"),
    returnPathIn = op.inBool("Output path if missing", false),
    resultOut = op.outString("Output"),
    foundOut = op.outBool("Found");

objectIn.ignoreValueSerialize = true;

objectIn.onChange =
    pathIn.onChange =
    returnPathIn.onChange = update;
pathIn.setUiAttribs({ "stringTrim": true });

pathIn.on("change", updateUi);
updateUi();
function updateUi()
{
    if (!pathIn.get())op.setUiError("nokey", "Missing Key Value");
    else op.setUiError("nokey", null);
}

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            let result = data[path];
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            if (!result) result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                let errorLevel = 2;
                result = null;
                foundOut.set(false);
                if (returnPathIn.get())
                {
                    result = path;
                    errorLevel = 1;
                }
                else
                {
                    result = null;
                }
                op.setUiError("missing", errorMsg, errorLevel);
            }
            else
            {
                foundOut.set(true);
                result = String(result);
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