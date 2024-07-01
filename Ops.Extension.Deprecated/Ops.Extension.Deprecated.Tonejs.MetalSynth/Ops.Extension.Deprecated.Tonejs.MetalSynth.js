// op vars
op.webAudio = op.webAudio || {};

// TODO:
// - add envelope:
//     - for this we need a mechanism to update the force the input port to
//       trigger an on-change event every time ADSR was edited
//

// vars
let node = new Tone.MetalSynth();

// inputs
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, node.get("frequency").frequency);
let envelopePort = op.inObject("Envelope", null, {
    "linkRecommendations": {
        "ops": [{
            "name": "Ops.WebAudio.Lib.Tonejs.Component.Envelope.Envelope",
            "port": "Signal"
        }
        ]
    }
});
envelopePort.changeAlways = true; // get updates when set was called in connected port

let modulationIndexPort = op.inValue("Modulation Index", node.get("modulationIndex").modulationIndex);
let harmonicityPort = op.inValue("Harmonicity", node.get("harmonicity").harmonicity);
let resonancePort = op.inValue("Resonance", node.get("resonance").resonance);
let octavesPort = op.inValue("Octaves", node.get("octaves").octaves);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, node.get("volume").volume);

// functions
op.webAudio.storeNodeSettings = function ()
{
    op.webAudio.nodeSettings = node.get();
};

op.webAudio.restoreNodeSettings = function ()
{
    if (op.webAudio.nodeSettings)
    {
        node.set(op.webAudio.nodeSettings);
    }
    else
    {
        op.log("Error: Could not restore node settings");
    }
};

// change listeners
modulationIndexPort.onChange = function ()
{
    let modulationIndex = modulationIndexPort.get();
    if (modulationIndex > 0)
    {
        node.set("modulationIndex", modulationIndex);
    }
    else
    {
        // TODO
    }
};

envelopePort.onLinkChanged = function ()
{
    console.log("LINK CHANGE");

    if (envelopePort.links.length > 0)
    {
        let otherOp = envelopePort.links[0].getOtherPort(envelopePort).parent;
        // otherOp.setValues({ "value":100 });
        otherOp.webAudio.setNodeSettings(node.get("envelope").envelope);
    }
};
envelopePort.onChange = function ()
{
    let env = envelopePort.get();
    if (env && env.get)
    {
        node.set("envelope", env.get());
    }
};

harmonicityPort.onChange = function ()
{
    let harmonicity = harmonicityPort.get();
    if (harmonicity > 0)
    {
        node.set("harmonicity", harmonicity);
    }
    else
    {
        // TODO
    }
};
resonancePort.onChange = function ()
{
    let resonance = resonancePort.get();
    if (resonance > 0)
    {
        node.set("resonance", resonance);
    }
    else
    {
        // TODO
    }
};
octavesPort.onChange = function ()
{
    let octaves = octavesPort.get();
    if (octaves > 0)
    {
        node.set("octaves", octaves);
    }
    else
    {
        // TODO
    }
};

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
