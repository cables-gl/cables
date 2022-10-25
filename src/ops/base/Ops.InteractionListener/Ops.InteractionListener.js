const
    duration = op.inValue("Duration", 0.5),
    events = op.outValue("Events");

let timeout = 0;
let listenerElement = null;

addListeners();

function afterEvent()
{
    events.set(false);
}

function onEvent()
{
    events.set(true);
    clearTimeout(timeout);
    timeout = setTimeout(afterEvent, duration.get() * 1000);
}

function addListeners()
{
    listenerElement = op.patch.cgl.canvas;
    // if(area.get()=='Document') listenerElement=document.body;

    listenerElement.addEventListener("mousemove", onEvent);
    listenerElement.addEventListener("mouseleave", onEvent);
    listenerElement.addEventListener("mousedown", onEvent);
    listenerElement.addEventListener("mouseup", onEvent);
    listenerElement.addEventListener("mouseenter", onEvent);
}

function removeLiseteners()
{
    listenerElement.removeEventListener("mousemove", onEvent);
    listenerElement.removeEventListener("mouseleave", onEvent);
    listenerElement.removeEventListener("mousedown", onEvent);
    listenerElement.removeEventListener("mouseup", onEvent);
    listenerElement.removeEventListener("mouseenter", onEvent);
    listenerElement = null;
}

this.onDelete = function ()
{
    removeLiseteners();
};
