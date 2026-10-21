const
    inKey = op.inString("Key"),
    inValue = op.inString("String", ""),
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outString("Stored String"),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBool("Storage Support", true);

let storage = null;
let storageSupport = false;
outStorage.set(inType.get());
updateStorage();

updateOutput();
inKey.onChange = updateOutput;
inType.onChange = changeStorage;
inStore.onTriggered = storeValue;

op.patch.on("localstorageStored", (key, val) =>
{
    if (key == inKey.get()) outValue.set(val);
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
        outValue.set(storage.getItem(getKey()));
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
    const val = inValue.get();
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
    outSupported.set(storageSupport);
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
