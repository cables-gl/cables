const
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outNumber("Stored Number"),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBoolNum("Storage Support", true);

let storage = null;
let storageSupport = false;
outStorage.set(inType.get());
updateStorage();

updateOutput();
op.onLoaded = updateOutput;
inKey.onChange = updateOutput;
inType.onChange = changeStorage;
inStore.onTriggered = storeValue;

function parse(val)
{
    if (val === "true" || val === true) val = 1;
    if (val === "false" || val === false) val = 0;
    val = parseFloat(val);
    if (val != val) val = 0;
    return val;
}

op.patch.on("localstorageStored", (key, val) =>
{
    if (key == inKey.get()) outValue.set(parse(val));
});

function getKey()
{
    return (op.patch.namespace || "") + inKey.get();
}

function updateOutput()
{
    outStorage.set(inType.get());
    outSupported.set(storageSupport);

    if (storageSupport)
    {
        outValue.set(parse(storage.getItem(getKey())));
    }
    else
    {
        outValue.set(inValue.get());
    }
}

function changeStorage()
{
    updateStorage();
    updateOutput();
}

function getStorage()
{
    try
    {
        if (inType.get() === "Session") return window.sessionStorage;
        return window.localStorage;
    }
    catch (e)
    {
        return null;
    }
}

function updateStorage()
{
    storage = getStorage();
    storageSupport = !!storage;
    outSupported.set(storageSupport);
    op.setUiError("nostorage", storageSupport ? null : "the browser does not support or blocks access to storage, the input value is used instead", 1);
}

function storeValue()
{
    outSupported.set(storageSupport);
    let val = parse(inValue.get());
    if (storageSupport)
    {
        try
        {
            storage.setItem(getKey(), val);
            op.setUiError("store", null);
        }
        catch (e)
        {
            op.setUiError("store", "could not store the value: " + e.message, 1);
        }
    }
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
