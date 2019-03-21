const
    outUrl=op.outString("URL"),
    outHost=op.outString("Host"),
    outHash=op.outString("Hash"),
    outPathname=op.outString("Pathname"),
    outProtocol=op.outString("Protocol"),
    outPort=op.outString("Port");

const l=document.location;

outUrl.set(l.href);
outHost.set(l.host);
outHash.set(l.hash);
outPathname.set(l.pathname);
outProtocol.set(l.protocol);
outPort.set(l.port);