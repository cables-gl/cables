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
    window.removeEventListener("hashchange", hashChange);
    window.removeEventListener("popstate", hashChange);
    window.removeEventListener("history_change", hashChange);
};

window.addEventListener("hashchange", hashChange);
window.addEventListener("popstate", hashChange);
window.addEventListener("history_change", hashChange);

const l = document.location;
outUrl.set(l.href);
outHost.set(l.host);
outHash.set(l.hash);
outPathname.set(l.pathname);
outProtocol.set(l.protocol);
outPort.set(l.port);

function hashChange()
{
    const l = document.location;
    outHash.set(l.hash);

    outChangeHash.trigger();
}
