// constants
let CANVAS_ELEMENT = op.patch.cgl.canvas;

// inputs
let selectorsPort = op.inValueString("Custom Selectors", "");

// outputs
let readyPort = op.outValue("Is Ready", false);

op.onLoaded = init; // wait for ports to be set

function init()
{
    let ctx = CABLES.WEBAUDIO.createAudioContext(op);
    let selectors = splitString(selectorsPort.get()) || CANVAS_ELEMENT;
    StartAudioContext(ctx, selectors, audioContextReady);
}

function splitString(s)
{
    if (!isString(s) || s.length === 0) { return null; }
    s.trim();
    return s.split(" ");
}

function isString(value) { return typeof value === "string"; }

function audioContextReady()
{
    readyPort.set(true);
}
