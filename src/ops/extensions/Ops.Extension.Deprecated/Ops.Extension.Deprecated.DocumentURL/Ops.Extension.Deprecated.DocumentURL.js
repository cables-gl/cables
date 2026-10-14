let outUrl = op.outNumber("URL");
let outHost = op.outNumber("Host");
let outHash = op.outNumber("Hash");
let outPathname = op.outNumber("Pathname");
let outProtocol = op.outNumber("Protocol");
let outPort = op.outNumber("Port");

let l = document.location;

outUrl.set(l.href);
outHost.set(l.host);
outHash.set(l.hash);
outPathname.set(l.pathname);
outProtocol.set(l.protocol);
outPort.set(l.port);
