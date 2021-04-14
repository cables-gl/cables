const routeIn = op.inString("Route");
const hashOut = op.outString("Hash");
const parsedOut = op.outObject("Values", {});
const changedOut = op.outTrigger("Changed");

let router = null;
let oldValues = {};

hashOut.set(window.location.href.split("#", 2)[1]);

if ("onhashchange" in window)
{
    router = new Navigo("/", { "hash": true, "noMatchWarning": true });
    window.removeEventListener("hashchange", hashChange);
    window.addEventListener("hashchange", hashChange);
    hashChange({ "newURL": window.location.href });
}
else
{
    op.setUiError("unsupported", "Your browser does not support listening to hashchanges!");
}

routeIn.onChange = function ()
{
    hashChange({ "newURL": window.location.href });
};

function hashChange(event)
{
    op.setUiError("unsupported", null);
    let values = {};
    const fields = event.newURL.split("#");
    let hash = "";
    if (fields.length > 1)
    {
        for (let i = 1; i < fields.length; i++)
        {
            let route = routeIn.get();
            let match = fields[i];
            hash += "#" + fields[i];
            if (!route)
            {
                route = "/";
                match = "/?" + fields[i];
            }
            const matched = router.matchLocation(route, match);
            if (matched)
            {
                if (matched.data) values = Object.assign(values, matched.data);
                if (matched.params) values = Object.assign(values, matched.params);
            }
        }
    }
    let changed = false;
    if (Object.keys(values).length !== Object.keys(oldValues).length)
    {
        changed = true;
    }
    else
    {
        const newKeys = Object.keys(values);
        for (let i = 0; i < newKeys.length; i++)
        {
            const key = newKeys[i];
            if (!oldValues[key])
            {
                changed = true;
                break;
            }
            if (oldValues[key] !== values[key])
            {
                changed = true;
                break;
            }
        }
        const oldKeys = Object.keys(values);
        for (let i = 0; i < oldKeys.length; i++)
        {
            const key = oldKeys[i];
            if (!values[key])
            {
                changed = true;
                break;
            }
            if (oldValues[key] !== values[key])
            {
                changed = true;
                break;
            }
        }
    }

    hashOut.set(hash);
    parsedOut.set(values);
    oldValues = values;
    if (changed)
    {
        changedOut.trigger();
    }
}

function getTypedValue(val)
{
    let value = decodeURIComponent(val || "");
    if (value !== "")
    {
        switch (value)
        {
        case "true":
            value = true;
            break;

        case "false":
            value = false;
            break;

        default:
            if (!isNaN(value))
            {
                value = Number(value);
            }
        }
    }
    return value;
}
