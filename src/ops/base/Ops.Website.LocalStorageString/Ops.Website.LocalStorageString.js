const
    inKey = op.inString("Key"),
    inValue = op.inString("String", ""),
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outString("Stored String"),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBool("Storage Support", true);

let storage = window.localStorage;
if (inType.get() === "Session") storage = window.sessionStorage;
outStorage.set(inType.get());

let storageSupport = !!storage;
if (!storageSupport)
{
    op.logError("Your browser does not support or blocks access to data storage, output will be inValue!");
    outSupported.set(false);
}

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
    storage = window.localStorage;
    if (inType.get() === "Session") storage = window.sessionStorage;
    storageSupport = !!storage;
    updateOutput();
}

function storeValue()
{
    const val = inValue.get();
    if (storageSupport)
    {
        storage.setItem(getKey(), val);
    }
    else
    {
        op.warn("Not storing data, missing browsersupport!");
    }
    outSupported.set(storageSupport);
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
