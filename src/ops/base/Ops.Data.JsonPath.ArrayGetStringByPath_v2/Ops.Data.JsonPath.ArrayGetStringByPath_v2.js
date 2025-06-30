const objectIn = op.inArray("Array");
const pathIn = op.inString("Path");
const returnPathIn = op.inBool("Return path if missing", false);
const resultOut = op.outString("Output");
const foundOut = op.outBoolNum("Found");

objectIn.onChange = update;
pathIn.onChange = update;
returnPathIn.onChange = update;

op.toWorkPortsNeedsString(pathIn);
op.toWorkPortsNeedToBeLinked(objectIn);

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    op.setUiError("notiterable", null);

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
            op.setUiAttrib({ "extendTitle": path });
            result = resolve(path, data);

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
                found = true;
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
