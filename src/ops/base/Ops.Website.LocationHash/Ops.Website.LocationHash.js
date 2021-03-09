const hashOut = op.outString("Hash");
const parsedOut = op.outObject("Values", {});
const changedOut = op.outTrigger("Changed");

if ("onhashchange" in window)
{
    window.removeEventListener("hashchange", hashChange);
    window.addEventListener("hashchange", hashChange);
    hashChange({ "newURL": window.location.href });
}
else
{
    op.setUiError("unsupported", "Your browser does not support listening to hashchanges!");
}

function hashChange(event)
{
    op.setUiError("unsupported", null);
    const values = {};
    const fields = event.newURL.split("#");
    let hash = "";
    if (fields.length > 1)
    {
        for (let i = 1; i < fields.length; i++)
        {
            hash += "#" + fields[i];
            const keyValues = fields[i].split("&");
            if (keyValues.length > 0)
            {
                for (let j = 0; j < keyValues.length; j++)
                {
                    const b = keyValues[j].split("=");
                    values[decodeURIComponent(b[0])] = getTypedValue(b[1]);
                }
            }
            else
            {
                const b = keyValues[j].split("=");
                if (b.length > 0)
                {
                    values[decodeURIComponent(b[0])] = getTypedValue(b[1]);
                }
                else
                {
                    values[decodeURIComponent(fields[i])] = "";
                }
            }
        }
    }
    hashOut.set(hash);
    parsedOut.set(values);
    changedOut.trigger();
}

function getTypedValue(val) {
    let value = decodeURIComponent(val || "");
    if(value !== "") {
        switch (value) {
            case "true":
                value = true;
                break;

            case "false":
                value = false;
                break;

            default:
                if(!isNaN(value)) {
                    value = Number(value);
                }
        }
    }
    return value;
}
