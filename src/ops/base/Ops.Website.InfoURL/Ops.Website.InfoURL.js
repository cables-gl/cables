const
    outUrl = op.outString("URL"),
    outHost = op.outString("Host"),
    outHash = op.outString("Hash"),
    outPathname = op.outString("Pathname"),
    outProtocol = op.outString("Protocol"),
    outPort = op.outString("Port"),
    outChangeHash = op.outTrigger("Hash Changed");

op.onDelete = () =>
{
    window.removeEventListener("hashchange", update);
    window.removeEventListener("popstate", update);
    window.removeEventListener("pushstate", update);
    window.removeEventListener("replacestate", update);
};

window.addEventListener("hashchange", update);
window.addEventListener("popstate", update);
window.addEventListener("pushstate", update);
window.addEventListener("replacestate", update);

function update(triggerChange = true)
{
    console.log("EVENT");
    const l = document.location;
    outUrl.set(l.href);
    outHost.set(l.host);
    outHash.set(l.hash);
    outPathname.set(l.pathname);
    outProtocol.set(l.protocol);
    outPort.set(l.port);

    if (triggerChange) outChangeHash.trigger();
}

update(false);
