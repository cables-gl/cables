const objectIn = op.inArray("Array");
const pathIn = op.inString("Path");
const resultOut = op.outString("Output");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            op.setUiError("notiterable", "input object of type " + (typeof data) + "is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            resultOut.set(resolve(path, data));
        }
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
