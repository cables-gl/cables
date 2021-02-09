const
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    inStore = op.inTriggerButton("Store"),
    outValue = op.outValue("Stored Number");

inKey.onChange = updateOutput;
inStore.onTriggered = storeValue;
updateOutput();

op.onLoaded = updateOutput;

function parse(val)
{
    console.log("parse", val);
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
    outValue.set(parse(window.localStorage.getItem(getKey())));
}

function storeValue()
{
    let val = parse(inValue.get());

    window.localStorage.setItem(getKey(), val);
    outValue.set(val);
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
