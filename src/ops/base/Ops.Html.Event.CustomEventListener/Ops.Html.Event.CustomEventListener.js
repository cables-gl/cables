// constants
var EVENT_NAME_DEFAULT = '';
var USE_CAPTURE_DEFAULT = false;
var PREVENT_DEFAULT_DEFAULT  = true;
var STOP_PROPAGATION_DEFAULT  = true;

// variables
var lastElement = null; // stores the last connected element, so we can remove prior event listeners
var lastEventName = EVENT_NAME_DEFAULT;
var lastUseCapture = USE_CAPTURE_DEFAULT;

// inputs
var elementPort = op.inObject('Element');
var eventNamePort = op.inValueString('Event Name', EVENT_NAME_DEFAULT);
var useCapturePort = op.inValueBool('Use Capture', USE_CAPTURE_DEFAULT);
var preventDefaultPort = op.inValueBool('Prevent Default', PREVENT_DEFAULT_DEFAULT);
var stopPropagationPort = op.inValueBool('Stop Propagation', STOP_PROPAGATION_DEFAULT);

// outputs
var triggerPort = op.outFunction('Event Trigger');
var eventObjPort = op.outObject('Event Object');

// change listeners
elementPort.onChange = update;
eventNamePort.onChange = update;
useCapturePort.onChange = update;

function update() {
    var element = elementPort.get();
    var eventName = eventNamePort.get();
    var useCapture = useCapturePort.get();
    removeListener();
    addListener(element, eventName, useCapture);
    lastElement = element;
    lastEventName = eventName;
    lastUseCapture = useCapture;
}

function removeListener() {
    if(lastElement && lastEventName) {
        lastElement.removeEventListener(lastEventName, handleEvent, lastUseCapture);
    }
}

function addListener(el, name, useCapture) {
    if(el && name) {
        el.addEventListener(name, handleEvent, useCapture);
    }
}

function handleEvent(ev) {
    eventObjPort.set(ev);
    if(preventDefaultPort.get()) { ev.preventDefault(); }
    if(stopPropagationPort.get()) { ev.stopPropagation(); }
    triggerPort.trigger();
}