const prefixIn = op.inString("Prefix", "");
const triggerOut = op.outTrigger("Trigger Out");
const triggerNameOut = op.outString("Trigger Name");

const listener = (triggerName) =>
{
    const prefix = prefixIn.get();
    if (triggerName)
    {
        if (prefix)
        {
            if (triggerName.startsWith(prefix))
            {
                triggerNameOut.set(triggerName);
                triggerOut.trigger();
            }
        }
        else
        {
            triggerNameOut.set(triggerName);
            triggerOut.trigger();
        }
    }
};

prefixIn.onChange = () =>
{
    if (prefixIn.get())
    {
        op.setUiAttrib({ "extendTitle": prefixIn.get() });
    }
};

op.patch.addEventListener("namedTriggerSent", listener);
