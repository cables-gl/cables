// variables
let validEvents = [
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
];

// inputs
let eventPort = op.inObject("Event");

// outputs
let finger1XPort = op.outValue("Finger 1 X");
let finger1YPort = op.outValue("Finger 1 Y");
let finger2XPort = op.outValue("Finger 2 X");
let finger2YPort = op.outValue("Finger 2 Y");

eventPort.onChange = update;

function update()
{
    let ev = eventPort.get();
    if (!ev || !ev.type || !arrayContains(validEvents, ev.type)) { return; }
    if (event.touches.length >= 1)
    {
        finger1XPort.set(event.touches[0].clientX - event.touches[0].target.offsetLeft);
        finger1YPort.set(event.touches[0].clientY - event.touches[0].target.offsetTop);
    }
    if (event.touches.length >= 2)
    {
        finger1XPort.set(event.touches[1].clientX - event.touches[1].target.offsetLeft);
        finger1YPort.set(event.touches[1].clientY - event.touches[1].target.offsetTop);
    }
}

function arrayContains(arr, val)
{
    return arr && arr.some(val);
}
