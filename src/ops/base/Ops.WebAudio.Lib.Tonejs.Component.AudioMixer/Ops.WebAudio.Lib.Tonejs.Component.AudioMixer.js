op.name="AudioMixer";

CABLES.WebAudio.createAudioContext(op);

// constants
var VOLUME_DEFAULT = 0;
var VOLUME_MIN = -96;
var VOLUME_MAX = 0;

// vars
var volumeNodes = [];
var labelPorts = [];
var audioInPorts = [];
var volumePorts = [];
var mutePorts = [];
var soloPorts = [];

var gainNode = new Tone.Gain();
var nPorts = 8;

// inputs
//var numberOfPortsPort = op.inValue("Number Of Ports");

// functions
function muteOnChange() {
    var i = this.data.index;
    op.log("Mute. Index: ", i);
    var mute = mutePorts[i].get();
    var volume = volumePorts[i].get();
    volumeNodes[i].set("mute", mute ? true : false);
    if(!mute) {
        //op.log("setting volume: ", volume);
        //op.log("... on node: ", volumeNodes[i]);
        volumeNodes[i].set("volume", volume);
    }
}

function volumeOnChange() {
    var i = this.data.index;
    var mute = mutePorts[i].get();
    var volume = volumePorts[i].get();
    if(!mute) {
        volumeNodes[i].set("volume", volume);
    }
}

// function create inputs
function createInputPorts() {
    for(var i=0; i<nPorts; i++) {
        // label port
        var labelPort = op.inValueString("Channel " + (i+1) + " Name", "Channel " + (i+1) + " Name");
        labelPorts.push(labelPort);
        // volume node
        var volumeNode = new Tone.Volume();
        volumeNode.connect(gainNode);
        volumeNodes.push(volumeNode);
        // audio in port
        var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Channel " + (i+1) + " Audio", volumeNode);
        audioInPort.data.index = i;
        audioInPorts.push(audioInPort);
        // volume port
        //var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Channel " + (i+1) + " Volume", volumeNode.volume, {"display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX}, VOLUME_DEFAULT);
        var volumePort = op.addInPort( new Port( op, "Channel " + (i+1) + " Volume", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX } ));
        volumePort.onChange = volumeOnChange.bind(volumePort);
        volumePort.data.index = i;
        volumePorts.push(volumePort);
        // mute port
        var mutePort = op.inValueBool("Channel " + (i+1) + " Mute", false);
        mutePort.data.index = i;
        mutePort.data.node = volumeNode;
        mutePort.onChange = muteOnChange.bind(mutePort);
        mutePorts.push(mutePort);
    }
}

// init
createInputPorts();

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", gainNode);