const
    inElement = op.inObject("Parent Element", null, "element"),
    inQuery = op.inString("Query"),
    inUpdate = op.inTriggerButton("Force Update"),
    outFirst = op.outObject("First element", null, "element"),
    outAll = op.outArray("Elements"),
    outFound = op.outBoolNum("Found");

op.toWorkPortsNeedToBeLinked(inElement);
op.toWorkPortsNeedsString(inQuery);

inUpdate.onTriggered = () => { update(true); };
inElement.onChange =
inQuery.onChange = () => { update(false); };

function update(force = false)
{
    op.setUiError("exc", null);
    const q = inQuery.get();
    op.setUiAttribs({ "extendTitle": q });

    if (!q)
    {
        op.setUiError("exc", "'" + q + "' is not a valid selector", 1);
        outAll.setRef([]);
        outFirst.setRef(null);
        outFound.set(false);
        return;
    }

    let found = false;
    try
    {
        let elements = [];
        let firstElement = null;
        if (inElement.get())
        {
            const els = inElement.get().querySelectorAll(q);
            elements = Array.from(els);
            if (elements && elements.length > 0) firstElement = elements[0];
        }
        outAll.setRef(elements);
        outFirst.setRef(firstElement);
        found = elements && elements.length > 0;
        outFound.set(elements.length > 0);
    }
    catch (e)
    {
        op.setUiError("exc", e.message, 1);
        op.logWarn(e);
    }
    outFound.set(found);
}
