const
    inValue = op.inString("String", ""),
    inKey = op.inString("Key", ""),
    outValue = op.outString("Stored String");

inKey.setUiAttribs({ hidePort: true, hideParam: true })

let storage = null;
let storageSupport = false;
updateStorage();

updateOutput();
inKey.onChange = updateOutput;

inValue.onChange = storeValue;

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

    outValue.set(storage.getItem(getKey()));
}

function changeStorage()
{
    updateStorage();
    updateOutput();
}

function updateStorage()
{
    storage = window.localStorage;
    storageSupport = !!storage;
    op.setUiError("nostorage", storageSupport ? null : "the browser does not support or blocks access to storage, the input value is used instead", 1);
}

function storeValue()
{
    const val = inValue.get();
    if (storageSupport)
    {
        try
        {
            storage.setItem(getKey(), val);
            op.setUiError("store", null);
        }
        catch (e)
        {
            op.setUiError("store", "could not store the value: " + e.message, 1);
        }
    }
    outValue.set(val);
    if (inKey.get() == "") inKey.set(CABLES.uuid());
    op.patch.emitEvent("localstorageStored", inKey.get(), val);
}
