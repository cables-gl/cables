const
    inValue = op.inString("String", ""),
    outValue = op.outString("Stored String");

let storage = null;
let storageSupport = false;
updateStorage();

updateOutput();

inValue.onChange = storeValue;

function getKey()
{
    return op.id;
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
    op.patch.emitEvent("localstorageStored", getKey(), val);
}
