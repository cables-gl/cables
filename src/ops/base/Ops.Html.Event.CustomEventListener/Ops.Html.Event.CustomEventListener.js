// constants
let EVENT_NAME_DEFAULT = "";
let USE_CAPTURE_DEFAULT = false;
let PREVENT_DEFAULT_DEFAULT = true;
let STOP_PROPAGATION_DEFAULT = true;

// variables
let lastElement = null; // stores the last connected element, so we can remove prior event listeners
let lastEventName = EVENT_NAME_DEFAULT;
let lastUseCapture = USE_CAPTURE_DEFAULT;

// inputs
let elementPort = op.inObject("Element");
let eventNamePort = op.inValueString("Event Name", EVENT_NAME_DEFAULT);
let useCapturePort = op.inValueBool("Use Capture", USE_CAPTURE_DEFAULT);
let preventDefaultPort = op.inValueBool("Prevent Default", PREVENT_DEFAULT_DEFAULT);
let stopPropagationPort = op.inValueBool("Stop Propagation", STOP_PROPAGATION_DEFAULT);

// outputs
let triggerPort = op.outTrigger("Event Trigger");
let eventObjPort = op.outObject("Event Object");

// change listeners
elementPort.onChange = update;
eventNamePort.onChange = update;
useCapturePort.onChange = update;

function update()
{
    let element = elementPort.get();
    let eventName = eventNamePort.get();
    let useCapture = useCapturePort.get();
    removeListener();
    addListener(element, eventName, useCapture);
    lastElement = element;
    lastEventName = eventName;
    lastUseCapture = useCapture;
}

function removeListener()
{
    if (lastElement && lastEventName)
    {
        lastElement.removeEventListener(lastEventName, handleEvent, lastUseCapture);
    }
}

function addListener(el, name, useCapture)
{
    if (el && name)
    {
        el.addEventListener(name, handleEvent, useCapture);
    }
}

function handleEvent(ev)
{
    eventObjPort.set(ev);
    if (preventDefaultPort.get()) { ev.preventDefault(); }
    if (stopPropagationPort.get()) { ev.stopPropagation(); }
    triggerPort.trigger();
}
