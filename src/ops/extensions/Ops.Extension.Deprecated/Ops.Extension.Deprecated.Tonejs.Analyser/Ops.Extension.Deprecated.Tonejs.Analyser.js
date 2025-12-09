CABLES.WEBAUDIO.createAudioContext(op);

// default values
let SIZE_DEFAULT = 1024;
// var SIZE_MIN = 32;
// var SIZE_MAX = 32768;
let SIZES = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
let RETURN_TYPES = ["byte", "float"]; // ?
let RETURN_TYPE_DEFAULT = "byte";
let TYPES = ["fft", "waveform"];
let TYPE_DEFAULT = "fft";
let SMOOTHING_DEFAULT = 0.8;
let SMOOTHING_MIN = 0.0;
let SMOOTHING_MAX = 1.0;
let MAX_DECIBELS_DEFAULT = 0;
let MIN_DECIBELS_DEFAULT = -99;
let DECIBELS_RANGE_MIN = -99;
let DECIBELS_RANGE_MAX = 0;

// vars
let node = new Tone.Analyser(TYPE_DEFAULT, SIZE_DEFAULT);

// in ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let refreshPort = op.addInPort(new CABLES.Port(this, "Refresh", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
// var sizePort = op.addInPort( new CABLES.Port( this, "Size", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': SIZE_MIN, 'max': SIZE_MAX }, SIZE_DEFAULT ));
let sizePort = this.addInPort(new CABLES.Port(this, "Size", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": SIZES }));
sizePort.set(SIZE_DEFAULT);
let typePort = this.addInPort(new CABLES.Port(this, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }));
typePort.set(TYPE_DEFAULT);
let smoothingPort = op.addInPort(new CABLES.Port(this, "Smoothing", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": SMOOTHING_MIN, "max": SMOOTHING_MAX }, SMOOTHING_DEFAULT));
smoothingPort.set(SMOOTHING_DEFAULT);
let maxDecibelsPort = op.addInPort(new CABLES.Port(this, "Max Decibels", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": DECIBELS_RANGE_MIN, "max": DECIBELS_RANGE_MAX }, MAX_DECIBELS_DEFAULT));
maxDecibelsPort.set(MAX_DECIBELS_DEFAULT);
let minDecibelsPort = op.addInPort(new CABLES.Port(this, "Min Decibels", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": DECIBELS_RANGE_MIN, "max": DECIBELS_RANGE_MAX }, MIN_DECIBELS_DEFAULT));
minDecibelsPort.set(MIN_DECIBELS_DEFAULT);
let returnTypePort = this.addInPort(new CABLES.Port(this, "Return Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": RETURN_TYPES }));
returnTypePort.set(RETURN_TYPE_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
let analyserArrayPort = op.outArray("Analyser Array");
analyserArrayPort.set([]);

// value change listeners
sizePort.onChange = function ()
{
    let size = sizePort.get();
    setNodeValue("size", parseInt(size));
};
typePort.onChange = function () { setNodeValue("type", typePort.get()); };
smoothingPort.onChange = function () { setNodeValue("smoothing", smoothingPort.get()); };
minDecibelsPort.onChange = function () { setNodeValue("minDecibels", parseInt(minDecibelsPort.get())); };
maxDecibelsPort.onChange = function () { setNodeValue("maxDecibels", parseInt(maxDecibelsPort.get())); };
refreshPort.onTriggered = function ()
{
    let arr = node.getValue();
    arr = Array.prototype.slice.call(arr); // convert to regular array
    analyserArrayPort.set(null);
    analyserArrayPort.set(arr);
};
returnTypePort.onChange = function () { setNodeValue("returnType", returnTypePort.get()); };

function setNodeValue(key, value)
{
    node.set(key, value);
}
