const
    hashIn = op.inString("Hash", ""),
    inUpdate = op.inTriggerButton("Update"),
    activeIn = op.inBool("Active", true),
    silentIn = op.inBool("Silent", true),
    reloadIn = op.inBool("Allow Empty", false);

inUpdate.onTriggered = update;

function update()
{
    if (!activeIn.get()) return;

    let hash = "";
    if (hashIn.get())
    {
        hash = "#" + hashIn.get();
    }

    if (window.location.hash == hash)
    {
        return;
    }

    try
    {
        op.setUiError("overload", null);
        const event = new Event("hashchange");
        event.oldURL = window.location.href;
        if (silentIn.get()) event.silent = true;

        if (hash)
        {
            history.replaceState(null, null, window.location.pathname + hash);
        }
        else if (reloadIn.get())
        {
            history.replaceState(null, null, window.location.pathname);
        }
        event.newURL = window.location.href;
        op.patch.emitEvent("LocationHashChange", event);
        window.dispatchEvent(event);
    }
    catch (e)
    {
        op.setUiError("overload", "too many changes to the location hash, throttle down");
        op.log(e.message);
    }
}
