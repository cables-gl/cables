const
    hashIn = op.inString("Hash", ""),
    routeIn = op.inString("Route", ""),
    valuesIn = op.inObject("Values", {}),
    inUpdate = op.inTriggerButton("Update"),
    activeIn = op.inBool("Active", false),
    silentIn = op.inBool("Silent", true),
    reloadIn = op.inBool("Allow Empty", false);

const router = new Navigo("/", { "hash": true, "noMatchWarning": true });

inUpdate.onTriggered = update;

function update()
{
    if (!activeIn.get()) return;

    let hash = "";
    if (hashIn.get())
    {
        hash = "#" + hashIn.get();
    }
    else
    {
        let route = routeIn.get();
        if (route)
        {
            const fields = window.location.hash.split("#");
            let replaced = false;
            if (fields.length > 1)
            {
                for (let i = 1; i < fields.length; i++)
                {
                    let match = fields[i];
                    const matched = router.matchLocation(route, match);
                    const tempRoute = {};
                    tempRoute[route] = { "as": "tempRoute", "uses": () => {} };
                    router.on(tempRoute);
                    const dataRoute = router.generate("tempRoute", valuesIn.get());
                    router.off(route);
                    if (matched)
                    {
                        hash += "#" + dataRoute;
                        replaced = true;
                    }
                    else
                    {
                        hash += "#" + fields[i];
                    }
                }
            }
            if (!replaced)
            {
                const tempRoute = {};
                tempRoute[route] = { "as": "tempRoute", "uses": () => {} };
                router.on(tempRoute);
                const dataRoute = router.generate("tempRoute", valuesIn.get());
                hash += "#" + dataRoute;
            }
        }
    }

    try
    {
        op.setUiError("overload", null);
        const event = new Event("hashchange");
        event.oldURL = window.location.href;
        if (silentIn.get()) event.silent = true;
        if (hash)
        {
            history.replaceState(null, null, window.location.pathname + hash);
        }
        else if (reloadIn.get())
        {
            history.replaceState(null, null, window.location.pathname);
        }
        event.newURL = window.location.href;
        op.patch.emitEvent("LocationHashChange", event);
        window.dispatchEvent(event);
    }
    catch (e)
    {
        op.setUiError("overload", "too many changes to the location hash, throttle down");
        op.log(e.message);
    }
}
