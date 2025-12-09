CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Convolver();

// default values
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let filePort = op.addInPort(new CABLES.Port(this, "File", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "audio" }));
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
let fileLoadedPort = op.outValue("File loaded");

// change listeners
filePort.onChange = loadAudioFile;

function loadAudioFile()
{
    let file = filePort.get();
    fileLoadedPort.set(false);
    if (file)
    {
        let url = op.patch.getFilePath(String(file));
        node.load(url, function ()
        {
            fileLoadedPort.set(true);
        });
    }
}

// init

fileLoadedPort.set(false);
op.onLoaded = function ()
{
    if (filePort.get().length === 0)
    {
        filePort.set("/assets/library/audio/impulse_responses/IR_Drainage_Tunnel.mp3"); // default IR
    }
};
