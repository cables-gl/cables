const
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inTrigger = op.inTriggerButton("Receive"),
    outKeys = op.outArray("Keys"),
    outAll = op.outObject("All", true),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBool("Storage Support", true);

let storage = null;
let storageSupport = false;
updateStorage();

updateOutput();
inType.onChange = changeStorage;
inTrigger.onTriggered = updateOutput;

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
    op.setUiError("nostorage", storageSupport ? null : "the browser does not support or blocks access to storage", 1);
}

function updateOutput()
{
    outStorage.set(inType.get());
    outSupported.set(storageSupport);

    if (storageSupport)
    {
        const keys = [];
        const all = {};

        for (let i = 0; i < storage.length; i++)
        {
            const key = storage.key(i);
            keys.push(key);
            all[key] = storage.getItem(key);
        }
        outAll.setRef(all);
        outKeys.setRef(keys);
    }
    else
    {
        outAll.set({});
        outKeys.set([]);
    }
}
