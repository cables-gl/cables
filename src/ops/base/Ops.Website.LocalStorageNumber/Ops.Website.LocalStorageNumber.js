const
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outNumber("Stored Number"),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBoolNum("Storage Support", true);

let storage = window.localStorage;
if (inType.get() === "Session") storage = window.sessionStorage;
outStorage.set(inType.get());

let storageSupport = !!storage;
if (!storageSupport)
{
    op.logError("Your browser does not support or blocks access to storage, output will be inValue!");
    outSupported.set(false);
}

updateOutput();
op.onLoaded = updateOutput;
inKey.onChange = updateOutput;
inType.onChange = changeStorage;
inStore.onTriggered = storeValue;

function parse(val)
{
    if (val === "true" || val === true)val = 1;
    if (val === "false" || val === false)val = 0;
    val = parseFloat(val);
    if (val != val)val = 0;
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
    storage = window.localStorage;
    if (inType.get() === "Session") storage = window.sessionStorage;
    storageSupport = !!storage;
    updateOutput();
}

function storeValue()
{
    outSupported.set(storageSupport);
    let val = parse(inValue.get());
    if (storageSupport)
    {
        storage.setItem(getKey(), val);
    }
    else
    {
        op.warn("Not storing data, missing browsersupport!");
    }
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
