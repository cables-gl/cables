// constants
var CANVAS_ELEMENT = op.patch.cgl.canvas;

// inputs
var selectorsPort = op.inValueString('Custom Selectors', '');

// outputs
var readyPort = op.outValue('Is Ready', false);

op.onLoaded = init; // wait for ports to be set

function init() {
    var ctx = CABLES.WEBAUDIO.createAudioContext(op);
    var selectors = splitString(selectorsPort.get()) || CANVAS_ELEMENT
    StartAudioContext(ctx, selectors, audioContextReady);
}

function splitString(s) {
    if(!isString(s) || s.length === 0) { return null; }
    s.trim();
    return s.split(' ');
}

function isString(value) { return typeof value === 'string'; }

function audioContextReady() {
    readyPort.set(true);
}