const objectIn = op.inArray("Array");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");
const foundOut = op.outBoolNum("Found");

objectIn.onChange = update;
pathIn.onChange = update;

pathIn.setUiAttribs({ "stringTrim": true });

function update()
{
    const data = objectIn.get();
    let result = [];
    const path = pathIn.get();
    op.setUiError("path", null);

    if (data && path)
    {
        if (!Array.isArray(data))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input of type " + (typeof data) + " is not an array");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            foundOut.set(false);

            const pathSuffix = parts.slice(1).join(".");

            for (let i = 0; i < data.length; i++)
            {
                const resolvePath = i + "." + pathSuffix;
                const resolvedData = resolve(resolvePath, data);
                if (typeof resolvedData !== "undefined")
                {
                    foundOut.set(true);
                }
                result.push(resolvedData);
            }
            const titleParts = pathIn.get().split(".");
            op.setUiAttrib({ "extendTitle": titleParts[titleParts.length - 1] + "" });
            if (foundOut.get())
            {
                resultOut.set(result);
            }
            else
            {
                op.setUiError("path", "given path seems to be invalid!", 1);
                resultOut.set([]);
            }
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
