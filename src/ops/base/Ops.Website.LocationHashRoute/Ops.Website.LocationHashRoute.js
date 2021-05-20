const routeIn = op.inString("Route");
const parsedOut = op.outObject("Values", {});
const changedOut = op.outTrigger("Changed");
const outMatching = op.outBool("Matching");

let router = null;

let lastHref = null;

op.onLoaded = function ()
{
    if ("onhashchange" in window)
    {
        router = new Navigo("/", { "hash": true, "noMatchWarning": true });
        const eventWrapper = (event) =>
        {
            event.internal = true;
            hashChange(event);
        };

        op.patch.removeEventListener("LocationHashChange" + op.id);
        op.patch.addEventListener("LocationHashChange" + op.id, eventWrapper);
        window.removeEventListener("hashchange", hashChange);
        window.addEventListener("hashchange", hashChange);
        hashChange({ "newURL": window.location.href });
    }
    else
    {
        op.setUiError("unsupported", "Your browser does not support listening to hashchanges!");
    }
};

routeIn.onChange = function ()
{
    if (router)
    {
        hashChange({ "newURL": window.location.href }, true);
    }
};

function hashChange(event, forceUpdate)
{
    let hash = "";
    if (!forceUpdate && (event.newURL === lastHref))
    {
        return;
    }
    op.setUiError("unsupported", null);
    let values = {};
    const fields = event.newURL.split("#");
    let hasMatch = false;
    if (routeIn.get())
    {
        if (router && fields.length > 1)
        {
            hasMatch = false;
            for (let i = 1; i < fields.length; i++)
            {
                let route = routeIn.get();
                let match = fields[i];
                hash += "#" + fields[i];
                const matched = router.matchLocation(route, match);
                if (matched)
                {
                    if (matched.data)
                    {
                        const keys = Object.keys(matched.data);
                        keys.forEach((key) =>
                        {
                            matched.data[key] = getTypedValue(matched.data[key]);
                        });
                        values = Object.assign(values, matched.data);
                    }
                    if (matched.params)
                    {
                        const keys = Object.keys(matched.params);
                        keys.forEach((key) =>
                        {
                            matched.params[key] = getTypedValue(matched.params[key]);
                        });
                        values = Object.assign(values, matched.params);
                    }
                    hasMatch = true;
                }
            }
        }
    }
    else
    {
        const all = event.newURL.split("#", 2);
        hash = all[1] || "";
        hasMatch = true;
    }

    if (hasMatch)
    {
        let paramStr = hash.split("?", 2);
        let params = parseQuery(paramStr[1]);
        let keys = Object.keys(params);
        keys.forEach((key) =>
        {
            if (!values.hasOwnProperty(key)) values[key] = params[key];
        });
    }

    outMatching.set(hasMatch);

    if (!(parsedOut.get().length === 0 && values.length === 0))
    {
        parsedOut.set(values);
    }

    if (hasMatch && !event.silent)
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

function parseQuery(str)
{
    if (typeof str != "string" || str.length == 0) return {};
    let s = str.split("&");
    let s_length = s.length;
    let bit, query = {}, first, second;
    for (let i = 0; i < s_length; i++)
    {
        bit = s[i].split("=");
        first = decodeURIComponent(bit[0]);
        if (first.length == 0) continue;
        second = decodeURIComponent(bit[1]);
        if (typeof query[first] == "undefined") query[first] = second;
        else if (query[first] instanceof Array) query[first].push(second);
        else query[first] = [query[first], second];
    }
    return query;
}
