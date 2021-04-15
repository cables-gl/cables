// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

const hashIn = op.inString("Hash", "");
const routeIn = op.inString("Route", "");
const valuesIn = op.inObject("Values", {});
const activeIn = op.inBool("Active", false);
const silentIn = op.inBool("Silent", true);
const reloadIn = op.inBool("Allow Empty", false);

const router = new Navigo("/", { "hash": true, "noMatchWarning": true });

let isActive = activeIn.get();

hashIn.onChange = update;
routeIn.onChange = update;
valuesIn.onChange = update;
activeIn.onChange = function ()
{
    isActive = activeIn.get();
    update();
};

function update()
{
    if (!isActive) return;

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
        window.dispatchEvent(event);
    }
    catch (e)
    {
        op.setUiError("overload", "too many changes to the location hash, throttle down");
        op.log(e.message);
    }
}
