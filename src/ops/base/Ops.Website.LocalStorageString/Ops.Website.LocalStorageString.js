const
    inKey = op.inString("Key"),
    inValue = op.inString("String", ""),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outString("Stored String");

inKey.onChange = updateOutput;
inStore.onTriggered = storeValue;
updateOutput();

function getKey()
{
    return (op.patch.namespace || "") + inKey.get();
}

function updateOutput()
{
    outValue.set(window.localStorage.getItem(getKey()));
}

function storeValue()
{
    const val = inValue.get();
    window.localStorage.setItem(getKey(), val);
    outValue.set(val);
}
