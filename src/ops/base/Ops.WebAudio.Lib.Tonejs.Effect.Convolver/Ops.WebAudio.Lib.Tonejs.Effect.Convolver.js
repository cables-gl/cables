op.name="Convolver";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Convolver();

// default values
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var filePort = op.addInPort( new Port( this, "File", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: 'audio'  } ));
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
var fileLoadedPort = op.outValue("File loaded");

// change listeners
filePort.onChange = loadAudioFile;

function loadAudioFile() {
    var file = filePort.get();
    fileLoadedPort.set(false);
    if(file) {
        node.load(file, function() {
            fileLoadedPort.set(true);
        });
    }
}

// init
filePort.set("/assets/library/audio/impulse_responses/IR_Drainage_Tunnel.mp3"); // default IR
fileLoadedPort.set(false);
loadAudioFile();