const
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outValue("Stored Number");

inKey.onChange = updateOutput;
inStore.onTriggered = storeValue;
updateOutput();

op.onLoaded = updateOutput;

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
