
// input ports
const chromeFilePort = op.inUrl("Chrome File");
const firefoxFilePort = op.inUrl("Firefox File");
const safariFilePort = op.inUrl("Safari File");
const ieFilePort = op.inUrl("IE <= 11 File");
const edgeFilePort = op.inUrl("Edge File");
const operaFilePort = op.inUrl("Opera File");
const defaultFilePort = op.inUrl("Default File");

// output port
const outFile = op.outString("Browser Specific File");
const detectedBrowserPort = op.outString("Detected Browser");

// change listeners
chromeFilePort.onChange = checkBrowserAndSetOutput;
firefoxFilePort.onChange = checkBrowserAndSetOutput;
safariFilePort.onChange = checkBrowserAndSetOutput;
ieFilePort.onChange = checkBrowserAndSetOutput;
edgeFilePort.onChange = checkBrowserAndSetOutput;
operaFilePort.onChange = checkBrowserAndSetOutput;
defaultFilePort.onChange = checkBrowserAndSetOutput;

const pf = platform;

// functions
const isOpera = pf.name === "Opera" || pf.name === "Opera Mobile";
const isSafari = pf.name === "Safari" || pf.name === "Firefox for iOS";
const isIE = pf.name === "IE" || pf.name === "IE Mobile";
const isEdge = pf.name === "Microsoft Edge";
const isChrome = pf.name === "Chrome" || pf.name === "Chrome Mobile";
const isFirefox = pf.name === "Firefox" || pf.name === "Firefox Mobile";


checkBrowserAndSetOutput();

function checkBrowserAndSetOutput() {
    if(isOpera) {
        outFile.set(operaFilePort.get() || defaultFilePort.get());
    } else if(isFirefox) {
        detectedBrowserPort.set("Firefox");
        outFile.set(firefoxFilePort.get() || defaultFilePort.get());
    } else if(isSafari) {
        detectedBrowserPort.set("Safari");
        outFile.set(safariFilePort.get() || defaultFilePort.get());
    } else if(isIE) {
        detectedBrowserPort.set("IE");
        outFile.set(ieFilePort.get() || defaultFilePort.get());
    } else if(isEdge) {
        detectedBrowserPort.set("Edge");
        outFile.set(edgeFilePort.get() || defaultFilePort.get());
    } else if(isChrome) {
        detectedBrowserPort.set("Chrome");
        outFile.set(chromeFilePort.get() || defaultFilePort.get());
    } else {
        detectedBrowserPort.set(pf.name);
        outFile.set(defaultFilePort.get());
    }
    detectedBrowserPort.set(pf.name);
}
