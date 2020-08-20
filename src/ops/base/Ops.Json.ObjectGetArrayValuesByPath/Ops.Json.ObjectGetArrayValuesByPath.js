const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    let result = [];
    const path = pathIn.get();

    if (data && path)
    {
        if (!Array.isArray(data) && (typeof data !== "object"))
        {
            op.setUiError("notiterable", "input object of type " + (typeof data) + "is not travesable by path");
        }
        else if (Array.isArray(data))
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");

            const pathSuffix = parts.slice(1).join(".");

            for (let i = 0; i < data.length; i++)
            {
                const resolvePath = i + "." + pathSuffix;
                result.push(resolve(resolvePath, data));
            }
            const titleParts = pathIn.get().split(".");
            op.setUiAttrib({ "extendTitle": titleParts[titleParts.length - 1] + "" });
            resultOut.set(result);
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
            if (checkData)
            {
                if (parts.length > 1)
                {
                    for (let i = 0; i < checkData.length; i++)
                    {
                        let resolvePath = pathPrefix + "." + i;
                        if (pathSuffix && pathSuffix !== "")
                        {
                            resolvePath += "." + pathSuffix;
                        }
                        const resolvedData = resolve(resolvePath, data);
                        result.push(resolvedData);
                    }
                }
                else
                {
                    if (Array.isArray(checkData))
                    {
                        result = checkData;
                    }
                    else
                    {
                        result = [checkData];
                    }
                }

                const titleParts = pathIn.get().split(".");
                const extendTitle = titleParts[titleParts.length - 1] + "";
                op.setUiAttrib({ "extendTitle": extendTitle });
            }

            resultOut.set(result);
        }
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
