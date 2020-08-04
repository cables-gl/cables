const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const result = [];
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

            // find first array in path
            let checkPath = "";
            let pathPrefix = "";
            let pathSuffix = "";
            let checkData = null;
            for (let i = 0; i < parts.length; i++)
            {
                checkPath += parts[i];
                checkData = resolve(checkPath, data);
                if (Array.isArray(checkData))
                {
                    pathPrefix = checkPath;
                    pathSuffix = parts.splice(i + 2, parts.length - (i + 2)).join(".");
                    break;
                }
                checkPath += ".";
            }
            for (let i = 0; i < checkData.length; i++)
            {
                const resolvePath = pathPrefix + "." + i + "." + pathSuffix;
                result.push(resolve(resolvePath, data));
            }
            const titleParts = pathIn.get().split(".");
            op.setUiAttrib({ "extendTitle": titleParts[titleParts.length - 1] + "" });
            resultOut.set(result);
        }
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
