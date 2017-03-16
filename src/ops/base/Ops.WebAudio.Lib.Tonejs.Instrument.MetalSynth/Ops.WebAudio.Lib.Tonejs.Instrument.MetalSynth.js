// op vars
op.name="MetalSynth";
op.webAudio = op.webAudio || {};

// TODO:
// - envelope
//

// vars
var node = new Tone.MetalSynth ();

// inputs
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, node.get("frequency").frequency);
var envelopePort = op.inObject("Envelope", null, {
        "linkRecommendations": {
            "ops": [ {
                    "name":"Ops.WebAudio.Lib.Tonejs.Component.Envelope.Envelope",
                    "port":"Signal"
                }
            ]
        }
});
var modulationIndexPort = op.inValue("Modulation Index", node.get("modulationIndex").modulationIndex);
var harmonicityPort = op.inValue("Harmonicity", node.get('harmonicity').harmonicity);
var resonancePort = op.inValue("Resonance", node.get('resonance').resonance);
var octavesPort = op.inValue("Octaves", node.get('octaves').octaves);
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, null, node.get("volume").volume);

// functions
op.webAudio.storeNodeSettings = function() {
    op.webAudio.nodeSettings = node.get();
};

op.webAudio.restoreNodeSettings = function() {
    if(op.webAudio.nodeSettings) {
        node.set(op.webAudio.nodeSettings);    
    } else {
        op.log("Error: Could not restore node settings");
    }
};

// change listeners
modulationIndexPort.onChange = function() {
    var modulationIndex = modulationIndexPort.get();
    if(modulationIndex > 0) {
        node.set("modulationIndex", modulationIndex);
    } else {
        // TODO
    }
};
envelopePort.onLinkChanged = function() {
    // TODO
};
harmonicityPort.onChange = function() {
    var harmonicity = harmonicityPort.get();
    if(harmonicity > 0) {
        node.set("harmonicity", harmonicity);    
    } else {
        // TODO
    }
};
resonancePort.onChange = function() {
    var resonance = resonancePort.get();
    if(resonance > 0) {
        node.set("resonance", resonance);    
    } else {
        // TODO
    }
};
octavesPort.onChange = function() {
    var octaves = octavesPort.get();
    if(octaves > 0) {
        node.set("octaves", octaves);    
    } else {
        // TODO
    }
};


//outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};