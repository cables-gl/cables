op.name="StartTransport";

CABLES.WEBAUDIO.createAudioContext(op);

// input ports
var startPort = op.addInPort( new CABLES.Port( this, "Start",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var timePort = op.inValueString("Time");
var offsetPort = op.inValueString("Offset");

// input port defaults
var TIME_DEFAULT = "+0";
var OFFSET_DEFAULT = "0";

// set default ports
timePort.set(TIME_DEFAULT);
offsetPort.set(OFFSET_DEFAULT);

// change listeners
startPort.onTriggered = function() {
    var time = timePort.get();
    var offset = timePort.get();
    if(time) {
        if(offset) {
            Tone.Transport.start(time, offset);
        } else {
            Tone.Transport.start(time);
        }
    } else {
        Tone.Transport.start();
    }
    op.log("Transport started with time: ", time);
};


