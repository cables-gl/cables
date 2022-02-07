const
    inKey = op.inString("Key"),
    inValue = op.inString("String", ""),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outString("Stored String"),
    outSupported = op.outBool("Storage Support", true);

const localStorageSupport = !!window.localStorage;
if (!localStorageSupport)
{
    op.logError("your browser does not support or blocks access to localStorage, output will be inValue!");
    outSupported.set(false);
}

updateOutput();
inKey.onChange = updateOutput;
inStore.onTriggered = storeValue;

function getKey()
{
    return (op.patch.namespace || "") + inKey.get();
}

function updateOutput()
{
    if (localStorageSupport)
    {
        outValue.set(window.localStorage.getItem(getKey()));
    }
    else
    {
        outValue.set(inValue.get());
    }
}

function storeValue()
{
    const val = inValue.get();
    if (localStorageSupport)
    {
        window.localStorage.setItem(getKey(), val);
    }
    else
    {
        op.warn("not storing to localstorage, missing browsersupport!");
    }
    outValue.set(val);
}
