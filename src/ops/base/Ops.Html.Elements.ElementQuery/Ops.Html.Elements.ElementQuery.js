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

let oldEles = [];

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

        if (!force)
        {
            if (elements && oldEles && elements.length != 0 && oldEles.length === elements.length)
            {
                let foundDiff = false;
                for (let i = 0; i < elements.length; i++)
                {
                    if (elements[i] != oldEles[i]) foundDiff = true;
                }
                if (!foundDiff) return;
            }
        }
        outAll.setRef(elements);
        outFirst.setRef(firstElement);
        found = elements && elements.length > 0;
        outFound.set(elements.length > 0);
        oldEles = elements;
    }
    catch (e)
    {
        op.setUiError("exc", e.message, 1);
        op.logWarn(e);
    }
    outFound.set(found);
}
