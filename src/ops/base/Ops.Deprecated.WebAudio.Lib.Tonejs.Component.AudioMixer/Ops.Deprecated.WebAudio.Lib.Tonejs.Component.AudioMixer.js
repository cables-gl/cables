CABLES.WEBAUDIO.createAudioContext(op);

// constants
let VOLUME_DEFAULT = -0.1;
let VOLUME_MIN = -96;
let VOLUME_MAX = -0.1;
let NONE = -1;

// vars
// every in-port has a data attribute "index": index in the array: port.data.index
let volumeNodes = [];
let labelPorts = [];
let audioInPorts = [];
let volumePorts = [];
let mutePorts = [];
let soloPorts = [];

let gainNode = new Tone.Gain();
let nPorts = 10;
let soloChannel = NONE; // index of the current solo channel

// functions
function muteOnChange()
{
    let i = this.data.index;
    let mute = mutePorts[i].get();
    let volume = volumePorts[i].get();
    volumeNodes[i].set("mute", !!mute);
    if (!mute && (soloChannel === i || soloChannel === NONE))
    {
        setVolume(volumeNodes[i], volume);
    }
}

function setVolume(node, volume)
{
    let volumeF;
    try
    {
        volumeF = parseFloat(volume);
    }
    catch (e)
    {
        op.log("Warning: volume is not a number");
        return;
    }
    if (volumeF < VOLUME_MIN) volumeF = VOLUME_MIN;
    else if (volumeF > VOLUME_MAX) volumeF = VOLUME_MAX;
    node.set("volume", volumeF);
}

function soloOnChange()
{
    let i = this.data.index;
    let solo = soloPorts[i].get();
    // if another channel was soloed before
    if (i !== soloChannel)
    {
        if (soloChannel !== NONE)
        {
            // uncheck previous solo UI toggle
            soloPorts[soloChannel].set(false);
            op.refreshParams();
        }
        soloChannel = i;
    }
    if (solo)
    {
        // set all volumes to VOLUME_MIN
        for (let j = 0; j < nPorts; j++)
        {
            setVolume(volumeNodes[j], VOLUME_MIN);
        }
        // set volume of soloed channel if not muted
        if (!mutePorts[soloChannel].get())
        {
            setVolume(volumeNodes[soloChannel], volumePorts[soloChannel].get());
        }
    }
    else
    { // unsolo
        // set all channels back to original volume if not muted
        for (let k = 0; k < nPorts; k++)
        {
            // set volume if not muted
            if (!mutePorts[k].get())
            {
                setVolume(volumeNodes[k], volumePorts[k].get());
            }
        }
        soloChannel = NONE;
    }
}

function volumeOnChange()
{
    let i = this.data.index;
    let mute = mutePorts[i].get();
    let volume = volumePorts[i].get();
    if (!mute && (soloChannel === i || soloChannel === NONE))
    {
        setVolume(volumeNodes[i], volume);
    }
}

// function create inputs
function createInputPorts()
{
    for (let i = 0; i < nPorts; i++)
    {
        // label port
        let labelPort = op.inValueString("Channel " + (i + 1) + " Name", "Channel " + (i + 1) + " Name");
        labelPorts.push(labelPort);
        // volume node
        let volumeNode = new Tone.Volume();
        volumeNode.connect(gainNode);
        volumeNodes.push(volumeNode);
        // audio in port
        let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Channel " + (i + 1) + " Audio", volumeNode);
        audioInPort.data.index = i;
        audioInPorts.push(audioInPort);
        // volume port
        let volumePort = op.addInPort(new CABLES.Port(op, "Channel " + (i + 1) + " Volume", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }));
        volumePort.onChange = volumeOnChange.bind(volumePort);
        volumePort.data.index = i;
        volumePorts.push(volumePort);
        // mute port
        let mutePort = op.inValueBool("Channel " + (i + 1) + " Mute", false);
        mutePort.data.index = i;
        mutePort.onChange = muteOnChange.bind(mutePort);
        mutePorts.push(mutePort);
        // solo port
        let soloPort = op.inValueBool("Channel " + (i + 1) + " Solo", false);
        soloPort.data.index = i;
        soloPort.onChange = soloOnChange.bind(soloPort);
        soloPorts.push(soloPort);
    }
}

// init
createInputPorts();

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", gainNode);

// clean up
op.onDelete = function ()
{
    for (let i = 0; i < nPorts; i++)
    {
        volumeNodes[i].dispose();
    }
    gainNode.dispose();
};
