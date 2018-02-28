// variables
var validEvents = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];

// inputs
var eventPort = op.inObject('Event');

// outputs
var finger1XPort = op.outValue('Finger 1 X');
var finger1YPort = op.outValue('Finger 1 Y');
var finger2XPort = op.outValue('Finger 2 X');
var finger2YPort = op.outValue('Finger 2 Y');

eventPort.onChange = update;

function update() {
    var ev = eventPort.get();
    if(!ev || !ev.type || !arrayContains(validEvents, ev.type)) { return; }
    if(event.touches.length >= 1) {
        finger1XPort.set(event.touches[0].clientX - event.touches[0].target.offsetLeft);
        finger1YPort.set(event.touches[0].clientY - event.touches[0].target.offsetTop);    
    }
    if(event.touches.length >= 2) {
        finger1XPort.set(event.touches[1].clientX - event.touches[1].target.offsetLeft);
        finger1YPort.set(event.touches[1].clientY - event.touches[1].target.offsetTop);    
    }
}

function arrayContains(arr, val) {
    return arr && arr.some(val);
}