var outUrl=op.outValue("URL");
var outHost=op.outValue("Host");
var outHash=op.outValue("Hash");
var outPathname=op.outValue("Pathname");
var outProtocol=op.outValue("Protocol");
var outPort=op.outValue("Port");

var l=document.location;

outUrl.set(l.href);
outHost.set(l.host);
outHash.set(l.hash);
outPathname.set(l.pathname);
outProtocol.set(l.protocol);
outPort.set(l.port);