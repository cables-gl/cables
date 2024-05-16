const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");
const foundOut = op.outBool("Found");

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
        if (typeof data !== "object")
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else if (Array.isArray(data))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input of type " + (typeof data) + " is not an object");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            foundOut.set(false);

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
                        if (typeof resolvedData !== "undefined")
                        {
                            foundOut.set(true);
                        }
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
                    foundOut.set(true);
                }

                const titleParts = pathIn.get().split(".");
                const extendTitle = titleParts[titleParts.length - 1] + "";
                op.setUiAttrib({ "extendTitle": extendTitle });
            }
            if (foundOut.get())
            {
                resultOut.setRef(result);
            }
            else
            {
                op.setUiError("path", "given path seems to be invalid!", 1);
                resultOut.setRef([]);
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
