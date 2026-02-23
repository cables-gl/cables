const
    inTrigger = op.inTriggerButton("Receive"),
    outKeys = op.outArray("Keys"),
    outAll = op.outObject("All", true),
    outSupported = op.outBool("Storage Support", true);

const localStorageSupport = !!window.localStorage;
if (!localStorageSupport)
{
    op.logError("your browser does not support or blocks access to localStorage!");
    outSupported.set(false);
}

updateOutput();
inTrigger.onTriggered = updateOutput;

function updateOutput()
{
    if (localStorageSupport)
    {
        const keys = [];
        const all = {};

        for (let i = 0; i < localStorage.length; i++)
        {
            const key = localStorage.key(i);
            keys.push(key);
            all[key] = localStorage.getItem(key);
        }
        outAll.setRef(all);
        outKeys.setRef(keys);
    }
    else
    {
        outAll.set([]);
        outKeys.set({});
    }
}
