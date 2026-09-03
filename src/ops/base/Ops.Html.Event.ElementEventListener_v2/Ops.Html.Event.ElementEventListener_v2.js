const
    elementPort = op.inObject("Element"),
    eventNamePort = op.inString("Event Name", ""),
    useCapturePort = op.inBool("Use Capture", false),
    preventDefaultPort = op.inBool("Prevent Default", true),
    stopPropagationPort = op.inBool("Stop Propagation", true),
    outEle = op.outObject("Element Passthrough"),
    triggerPort = op.outTrigger("Event Trigger"),
    eventObjPort = op.outObject("Event Object"),
    eventElePort = op.outObject("Event Element", null, "element");

let lastElement = null; // stores the last connected element, so we can remove prior event listeners
let lastEventName = "";
let lastUseCapture = false;

elementPort.onChange = () =>
{
    outEle.setRef(elementPort.get());
    update();
};

eventNamePort.onChange =
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
    op.setUiAttrib({ "extendTitle": eventNamePort.get() });
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
    eventElePort.set(ev.target);
    triggerPort.trigger();
}
