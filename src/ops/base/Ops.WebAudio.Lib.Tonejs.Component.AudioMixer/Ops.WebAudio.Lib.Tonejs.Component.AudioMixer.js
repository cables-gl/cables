op.name="AudioMixer";

CABLES.WebAudio.createAudioContext(op);

// constants
var VOLUME_DEFAULT = 0;
var VOLUME_MIN = -96;
var VOLUME_MAX = 0;
var NONE = -1;

// vars
// every in-port has a data attribute "index": index in the array: port.data.index
var volumeNodes = [];
var labelPorts = [];
var audioInPorts = [];
var volumePorts = [];
var mutePorts = [];
var soloPorts = [];

var gainNode = new Tone.Gain();
var nPorts = 10;
var soloChannel = NONE; // index of the current solo channel

// functions
function muteOnChange() {
    var i = this.data.index;
    var mute = mutePorts[i].get();
    var volume = volumePorts[i].get();
    volumeNodes[i].set("mute", mute ? true : false);
    if(!mute && (soloChannel === i || soloChannel === NONE)) {
        volumeNodes[i].set("volume", volume);
    }
}

function soloOnChange() {
    var i = this.data.index;
    var solo = soloPorts[i].get();
    // if another channel was soloed before
    if(i !== soloChannel) {
        if(soloChannel !== NONE) {
            // uncheck previous solo UI toggle
            soloPorts[soloChannel].set(false);    
            if(gui) gui.patch().showOpParams(op);
        }
        soloChannel = i;
    }
    if(solo) {
        // set all volumes to VOLUME_MIN
        for(var j=0; j<nPorts; j++) {
            volumeNodes[j].set("volume", VOLUME_MIN);
        }
        // set volume of soloed channel if not muted
        if(!mutePorts[soloChannel].get()) {
            volumeNodes[soloChannel].set("volume", volumePorts[soloChannel].get()); // TODO: Add min, max check        
        }
    } else { // unsolo
        // set all channels back to original volume if not muted   
        for(var k=0; k<nPorts; k++) {
            // set volume if not muted
            if(!mutePorts[k].get()) {
                volumeNodes[k].set("volume", volumePorts[k].get());    
            }
        }
        soloChannel = NONE;
    }
}

function volumeOnChange() {
    var i = this.data.index;
    var mute = mutePorts[i].get();
    var volume = volumePorts[i].get();
    if(!mute && (soloChannel === i || soloChannel === NONE)) {
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
        var volumePort = op.addInPort( new Port( op, "Channel " + (i+1) + " Volume", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX } ));
        volumePort.onChange = volumeOnChange.bind(volumePort);
        volumePort.data.index = i;
        volumePorts.push(volumePort);
        // mute port
        var mutePort = op.inValueBool("Channel " + (i+1) + " Mute", false);
        mutePort.data.index = i;
        mutePort.onChange = muteOnChange.bind(mutePort);
        mutePorts.push(mutePort);
        // solo port
        var soloPort = op.inValueBool("Channel " + (i+1) + " Solo", false);
        soloPort.data.index = i;
        soloPort.onChange = soloOnChange.bind(soloPort);
        soloPorts.push(soloPort);
    }
}

// init
createInputPorts();

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", gainNode);