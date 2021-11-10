/* eslint-disable no-console */

export default class Logger
{
    constructor(initiator)
    {
        this._logs = [];
        this.initiator = initiator;
    }

    stack(t)
    {
        console.error("[" + this.initiator + "] stack");
        console.log((new Error()).stack);
    }

    groupCollapsed(t)
    {
        console.groupCollapsed("[" + this.initiator + "] " + t);
    }

    table(t)
    {
        console.table(t);
    }

    groupEnd()
    {
        console.groupEnd();
    }

    error(args)
    {
        console.error("[" + this.initiator + "]", ...arguments);
    }

    info(args)
    {
        console.error("[" + this.initiator + "]", ...arguments);
    }

    warn(args)
    {
        console.warn("[" + this.initiator + "]", ...arguments);
    }

    verbose()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
    }

    log(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
    }

    userInteraction(text)
    {
        // this.log({ "initiator": "userinteraction", "text": text });
    }
}
