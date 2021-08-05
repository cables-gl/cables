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
};

window.addEventListener("hashchange", hashChange);

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
