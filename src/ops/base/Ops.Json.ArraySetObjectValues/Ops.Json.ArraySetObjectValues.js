const inArr = op.inArray("Array of objects");
const inData = op.inArray("Data per object");
const inKey = op.inString("Key in each object");
const inCopy = op.inBool("Copy Array", false); // Default is false, meaning it modifies the original array

const outArr = op.outArray("Updated array");

inArr.onChange = inData.onChange = inKey.onChange = inCopy.onChange = run;

function run()
{
    const objects = inArr.get();
    const data = inData.get();
    const key = inKey.get().trim();
    const copyArray = inCopy.get();

    // Check for empty key or arrays
    if (!key || !objects || !data)
    {
        return null;
    }

    // Validate key - check it does not end with a dot
    if (key.endsWith("."))
    {
        op.logError(`Invalid key: ${key}`);
        op.setUiError("key", `Invalid key: ${key}`);
        return null;
    }

    // Determine whether to modify the original array or use a copy
    let targetArray = objects;
    if (copyArray)
    {
        // Create a deep copy of the objects array
        targetArray = JSON.parse(JSON.stringify(objects));
    }

    try
    {
        // Function to set a value at a nested path
        function setValue(obj, path, value)
        {
            const keys = path.split(".");
            const lastKey = keys.pop();
            if (!lastKey)
            { // Additional check in case of empty last key due to trailing dots or double dots
                throw new Error(`Invalid path detected: ${path}`);
            }
            const lastObj = keys.reduce((o, k) =>
            {
                if (!k)
                { // Check for empty key parts, e.g., due to ".."
                    throw new Error(`Invalid path segment: ${path}`);
                }
                return o[k] = o[k] || {};
            }, obj);
            if (!(lastObj instanceof Object))
            {
                throw new Error(`Attempting to set property on non-object: ${lastObj}`);
            }
            lastObj[lastKey] = value;
        }

        // Update each object in the target array with corresponding data using the specified key
        for (let i = 0; i < targetArray.length && i < data.length; i++)
        {
            if (targetArray[i] != null && data[i] != null)
            {
                setValue(targetArray[i], key, data[i]);
            }
        }

        op.setUiError("key", null);
        op.setUiError("general", null);
        // Set the possibly modified array as the output
        outArr.setRef(targetArray);
    }
    catch (error)
    {
        op.logError(error.message);
        op.setUiError("general", error.message);
        outArr.set(null);
    }
}
