const routeIn = op.inString("Route");
const parsedOut = op.outObject("Values", {});
const changedOut = op.outTrigger("Changed");
const outMatching = op.outBool("Matching");

let lastHref = null;
let hashChangeListener = null;

// op.onLoadedValueSet = init;

function init()
{
    if ("onhashchange" in window)
    {
        const eventWrapper = (event) =>
        {
            event.internal = true;
            hashChange(event);
        };

        if (hashChangeListener)
        {
            op.patch.removeEventListener(hashChangeListener);
            hashChangeListener = null;
        }
        hashChangeListener = op.patch.addEventListener("LocationHashChange", eventWrapper);
        window.removeEventListener("hashchange", hashChangeFromBrowser);
        window.addEventListener("hashchange", hashChangeFromBrowser);
        hashChange({ "newURL": window.location.href });
    }
    else
    {
        op.setUiError("unsupported", "Your browser does not support listening to hashchanges!");
    }
}

init();

function hashChangeFromBrowser(event)
{
    hashChange(event);
}

op.onDelete = function ()
{
    if (hashChangeListener)
    {
        op.patch.removeEventListener(hashChangeListener);
        hashChangeListener = null;
    }
    window.removeEventListener("hashchange", hashChangeFromBrowser);
};

routeIn.onChange = function ()
{
    hashChange({ "newURL": window.location.href }, true);
};

function hashChange(event, forceUpdate)
{
    let hash = "";
    if (!forceUpdate && (event.newURL === lastHref))
    {
        return;
    }
    lastHref = event.newURL;
    op.setUiError("unsupported", null);
    let values = {};
    const fields = event.newURL.split("#");
    let hasMatch = false;
    if (routeIn.get())
    {
        if (fields.length > 1)
        {
            hasMatch = false;
            for (let i = 1; i < fields.length; i++)
            {
                let route = routeIn.get();
                let match = fields[i];
                hash += "#" + fields[i];
                let matched = false;
                op.setUiError("regex", null);
                try
                {
                    matched = matchLocation(route, match);
                }
                catch (e)
                {
                    op.setUiError("regex", "Failed to parse route string, check documentation. <br>- " + e.message);
                }
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

// https://github.com/krasimir/navigo
function matchLocation(path, currentLocation)
{
    if (typeof currentLocation !== "undefined")
    {
        currentLocation = "/" + cleanPath(currentLocation);
    }

    let context = {
        "to": currentLocation,
        "currentLocationPath": currentLocation
    };
    if (typeof context.currentLocationPath === "undefined")
    {
        let envUrl = "/";
        if (typeof window !== "undefined")
        {
            envUrl = location.pathname + location.search + location.hash;
        }
        context.currentLocationPath = context.to = envUrl;
    }
    if (context.currentLocationPath.indexOf("#") >= 0)
    {
        context.currentLocationPath = context.currentLocationPath.split("#")[1] || "/";
    }

    if (typeof path === "string")
    {
        path = "/" + cleanPath(path);
    }

    let match = matchRoute(context, {
        "name": String(path),
        "path": path,
        "handler": function handler() {},
        "hooks": {}
    });
    return match || false;
}

// https://github.com/krasimir/navigo
function cleanPath(s)
{
    return s.replace(/\/+$/, "").replace(/^\/+/, "");
}

// https://github.com/krasimir/navigo
function matchRoute(context, route)
{
    let tmp = cleanPath(context.currentLocationPath).split(/\?(.*)?$/);
    let _extractGETParameters = [cleanPath(tmp[0]), tmp.slice(1).join("")];

    let current = _extractGETParameters[0],
        GETParams = _extractGETParameters[1];

    let params = GETParams === "" ? null : parseQuery(GETParams);
    let paramNames = [];
    let pattern;

    if (typeof route.path === "string")
    {
        pattern = "(?:/^|^)" + cleanPath(route.path).replace(/([:*])(\w+)/g, function (full, dots, name)
        {
            paramNames.push(name);
            return "([^/]+)";
        }).replace(/\*/g, "?(?:.*)").replace(/\/\?/g, "/?([^/]+|)") + "$";

        if (cleanPath(route.path) === "")
        {
            if (cleanPath(current) === "")
            {
                let hash = "";
                if (context.to && context.to.indexOf("#") >= 0)
                {
                    hash = context.to.split("#").pop() || "";
                }

                return {
                    "url": current,
                    "queryString": GETParams,
                    "hashString": hash,
                    "route": route,
                    "data": null,
                    "params": params
                };
            }
        }
    }
    else
    {
        pattern = route.path;
    }

    let regexp = new RegExp(pattern, "");
    let match = current.match(regexp);

    if (match)
    {
        let data = null;
        if (typeof route.path === "string")
        {
            if (paramNames.length === 0)
            {
                data = null;
            }
            else
            {
                data = match.slice(1, match.length).reduce(function (p, value, index)
                {
                    if (p === null) p = {};
                    p[paramNames[index]] = decodeURIComponent(value);
                    return p;
                }, null);
            }
        }
        else if (match.groups)
        {
            data = match.groups;
        }
        if (!data) data = match.slice(1);

        let hash = "";
        if (context.to && context.to.indexOf("#") >= 0)
        {
            hash = context.to.split("#").pop() || "";
        }
        return {
            "url": cleanPath(current.replace(new RegExp("^/"), "")),
            "queryString": GETParams,
            "hashString": hash,
            "route": route,
            "data": data,
            "params": params
        };
    }

    return false;
}
