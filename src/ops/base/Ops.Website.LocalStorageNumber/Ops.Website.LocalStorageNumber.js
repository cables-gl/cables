const
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outNumber("Stored Number"),
    outSupported = op.outBoolNum("Storage Support", true);

inKey.onChange = updateOutput;
inStore.onTriggered = storeValue;

const localStorageSupport = !!window.localStorage;
if (!localStorageSupport)
{
    op.logError("your browser does not support or blocks access to localStorage, output will be inValue!");
    outSupported.set(false);
}

updateOutput();
op.onLoaded = updateOutput;

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
    if (localStorageSupport)
    {
        outValue.set(parse(window.localStorage.getItem(getKey())));
    }
    else
    {
        outValue.set(inValue.get());
    }
}

function storeValue()
{
    let val = parse(inValue.get());

    if (localStorageSupport)
    {
        window.localStorage.setItem(getKey(), val);
    }
    else
    {
        op.warn("not storing to localstorage, missing browsersupport!");
    }
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
