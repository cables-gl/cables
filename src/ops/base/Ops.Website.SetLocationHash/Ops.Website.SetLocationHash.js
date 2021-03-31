// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

const hashIn = op.inString("Hash", "");
const routeIn = op.inString("Route", "");
const valuesIn = op.inObject("Values", {});
const testTr = op.inTriggerButton("Update");

const router = new Navigo("/", { "hash": true, "noMatchWarning": true });

testTr.onTriggered = () =>
{
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

    window.location.hash = hash;
};
