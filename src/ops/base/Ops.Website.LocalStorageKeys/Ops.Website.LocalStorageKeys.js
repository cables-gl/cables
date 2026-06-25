const
    inType = op.inSwitch("Storage", ["Local", "Session"], "Local"),
    inTrigger = op.inTriggerButton("Receive"),
    outKeys = op.outArray("Keys"),
    outAll = op.outObject("All", true),
    outStorage = op.outString("Storage type"),
    outSupported = op.outBool("Storage Support", true);

let storage = window.localStorage;
if (inType.get() === "Session") storage = window.sessionStorage;

let storageSupport = !!storage;
if (!storageSupport)
{
    op.logError("Your browser does not support or blocks access to storage!");
    outSupported.set(false);
}

updateOutput();
inType.onChange = changeStorage;
inTrigger.onTriggered = updateOutput;

function changeStorage()
{
    storage = window.localStorage;
    if (inType.get() === "Session") storage = window.sessionStorage;
    outStorage.set(inType.get());
    storageSupport = !!storage;
    updateOutput();
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
