const inElements = op.inArray("Elements", null, "element");
const eventNamePort = op.inString("Event Name", "click");
const useCapturePort = op.inValueBool("Use Capture", false);
const preventDefaultPort = op.inValueBool("Prevent Default", true);
const stopPropagationPort = op.inValueBool("Stop Propagation", true);
const triggerPort = op.outTrigger("Event Trigger");
const outIndex = op.outNumber("Index", -1);
const eventObjPort = op.outObject("Event Object");
const eventElementPort = op.outObject("Event Element", null, "element");

op.onDelete = removeListeners;

const indexKey = "op" + op.id + "listenerIndex";

let currentElements = [];
let currentEventName = "";

const handleEvent = (event) =>
{
    const element = event.currentTarget;
    outIndex.set(-1);
    if (element.dataset.hasOwnProperty(indexKey)) outIndex.set(parseInt(element.dataset[indexKey], 10));
    eventObjPort.setRef(event);
    eventElementPort.setRef(element);
    triggerPort.trigger();
};

eventNamePort.onChange =
useCapturePort.onChange =
preventDefaultPort.onChange =
stopPropagationPort.onChange =
inElements.onChange = () =>
{
    if (!eventNamePort.get()) return;
    removeListeners(currentEventName);
    currentElements = inElements.get() || [];
    currentEventName = eventNamePort.get();
    addListeners(currentEventName);
};

function addListeners(eventName)
{
    currentElements.forEach((element, index) =>
    {
        element.dataset[indexKey] = index;
        element.addEventListener(eventName, handleEvent, useCapturePort.get());
    });
}

function removeListeners(eventName)
{
    currentElements.forEach((element) =>
    {
        element.removeEventListener(eventName, handleEvent, useCapturePort.get());
        element.removeEventListener(eventName, handleEvent, !useCapturePort.get());
    });
}
