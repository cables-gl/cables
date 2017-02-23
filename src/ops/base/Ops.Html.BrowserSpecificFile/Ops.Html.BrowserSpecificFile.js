op.name="BrowserSpecificFile";

// input ports
var chromeFilePort = op.addInPort( new Port( op, "Chrome File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var firefoxFilePort = op.addInPort( new Port( op, "Firefox File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var safariFilePort = op.addInPort( new Port( op, "Safari File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var ieFilePort = op.addInPort( new Port( op, "IE <= 11 File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var edgeFilePort = op.addInPort( new Port( op, "Edge File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var operaFilePort = op.addInPort( new Port( op, "Opera File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));
var defaultFilePort = op.addInPort( new Port( op, "Default File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: null  } ));

// output port
var outFile = op.outValue("Browser Specific File");

// change listeners
chromeFilePort.onChange = checkBrowserAndSetOutput;
firefoxFilePort.onChange = checkBrowserAndSetOutput;
safariFilePort.onChange = checkBrowserAndSetOutput;
ieFilePort.onChange = checkBrowserAndSetOutput;
edgeFilePort.onChange = checkBrowserAndSetOutput;
operaFilePort.onChange = checkBrowserAndSetOutput;
defaultFilePort.onChange = checkBrowserAndSetOutput;

// functions

// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
isFirefox = typeof InstallTrigger !== 'undefined';
// Safari 3.0+
isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
// Internet Explorer 6-11
isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
isEdge = !isIE && !!window.StyleMedia;
// Chrome 1+
isChrome = !!window.chrome && !!window.chrome.webstore;
// Blink engine detection
isBlink = (isChrome || isOpera) && !!window.CSS;

function checkBrowserAndSetOutput() {
    if(isOpera) {
        outFile.set(operaFilePort.get() || defaultFilePort.get());
    } else if(isFirefox) {
        outFile.set(firefoxFilePort.get() || defaultFilePort.get());
    } else if(isSafari) {
        outFile.set(safariFilePort.get() || defaultFilePort.get());
    } else if(isIE) {
        outFile.set(ieFilePort.get() || defaultFilePort.get());
    } else if(isEdge) {
        outFile.set(edgeFilePort.get() || defaultFilePort.get());
    } else if(isChrome) {
        outFile.set(chromeFilePort.get() || defaultFilePort.get());
    } else {
        outFile.set(defaultFilePort.get());
    }
}
