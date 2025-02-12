// variables
let lastElement = null; // stores the last connected element, so we can remove prior event listeners
let subscribedEvents = []; // array of event-names the currrent element is subscribed to

/**
 * events to subscribe to
 * displayName is used for the port names
 * will later hold the trigger port and handler-function,
 * e.g. { name: 'mousedown', displayName: 'Mouse Down', port: ..., handler: ... }
 */
let events = [
    {
        "name": "pointerdown",
        "displayName": "Pointer Down"
    },
    {
        "name": "pointerenter",
        "displayName": "Pointer Enter"
    },
    {
        "name": "pointerup",
        "displayName": "Pointer Up"
    },
    {
        "name": "pointermove",
        "displayName": "Pointer Move"
    },
    {
        "name": "pointerover",
        "displayName": "Pointer Over"
    },
    {
        "name": "pointerout",
        "displayName": "Pointer Out"
    },
    {
        "name": "pointerleave",
        "displayName": "Pointer Leave"
    },
    {
        "name": "pointercancel",
        "displayName": "Pointer Cancel"
    },

];

/**
 * Creates an event handler function
 * @param {Object} event an element of the events array (see top)
 */
function handlerFactory(event)
{
    function handleEvent(ev)
    {
        eventPort.set(ev); // set the event object port
        eventNamePort.set(ev.type);
        ev.preventDefault(); // TODO: maybe add a toggle for every event. but then we need port-groups...
        event.port.trigger(); // trigger the appropriate port
    }

    return handleEvent;
}

/**
 * Creates a trigger port for each event type, add the port to the events object-array
 */
function createPorts()
{
    events.forEach(function (event)
    {
        event.port = op.outTrigger(event.displayName);
        event.handler = handlerFactory(event);
    });
    op.log(events);
}

// ports
let elementPort = op.inObject("Dom Element");
elementPort.onChange = onElementChanged;
let eventPort = op.outObject("Event Object");
createPorts();
let eventNamePort = op.outString("Event Name");

/**
 * Called when element port (DOM elemenet) changed
 */
function onElementChanged()
{
    let element = elementPort.get();
    if (lastElement !== element)
    {
        removeAllListeners(lastElement);
    }
    if (element)
    {
        addListeners(element);
    }
    checkListeners(element);
    lastElement = element;
}

/**
 * Checks all toggle-ports and adds / removes listeners accordingly
 */
function checkListeners(element)
{
    events.forEach(function (event)
    {
        addListener(element, event);
    });
}

/**
 * Removes all listeners added by this op for the element
 */
function removeAllListeners(element)
{
    if (element)
    {
        for (let i = subscribedEvents.length - 1; i >= 0; i--)
        {
            removeListener(element, subscribedEvents[i]);
        }
    }
}

function removeListener(element, eventName)
{
    if (!element || !eventName || !arrayContainsValue(subscribedEvents, eventName)) { return; }
    let subscribedEventIndex = subscribedEvents.indexOf(eventName);
    element.removeEventListener(eventName, getEventByName(eventName).handler);
    subscribedEvents.splice(subscribedEventIndex, 1);
}

function arrayContainsValue(arr, v)
{
    return arr && arr.indexOf(v) > -1;
}

/**
 * Returns an event-object from the events array
 * @param {string} name e.g. 'mousedown'
 */
function getEventByName(eventName)
{
    for (let i = 0; i < events.length; i++)
    {
        if (events[i].name == eventName)
        {
            return events[i];
        }
    }
    return null;
}

/**
 * Adds all listeners to the element and saves it in the events array
 */
function addListeners(element)
{
    if (!element) { return; }
    events.forEach(function (event)
    {
        addListener(element, event);
    });
}

/**
 * Adds a listener to the element
 * @param {Object} element the HTML DOM element
 * @param {Object} event the event object from the events-array
 */
function addListener(element, event)
{
    if (!element || !event) { return; }
    if (subscribedEvents.indexOf(event.name) > -1) { return; } // already subscribed
    // if (!event.togglePort.get()) { return; } // toggle for event not set
    element.addEventListener(event.name, event.handler);
    subscribedEvents.push(event.name);
}

op.onDelete = function ()
{
    removeAllListeners(lastElement);
    removeAllListeners(elementPort.get());
};
