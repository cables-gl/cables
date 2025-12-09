let outUrl = op.outValue("URL");
let outHost = op.outValue("Host");
let outHash = op.outValue("Hash");
let outPathname = op.outValue("Pathname");
let outProtocol = op.outValue("Protocol");
let outPort = op.outValue("Port");

let l = document.location;

outUrl.set(l.href);
outHost.set(l.host);
outHash.set(l.hash);
outPathname.set(l.pathname);
outProtocol.set(l.protocol);
outPort.set(l.port);
