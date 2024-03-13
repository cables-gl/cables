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
        console.info("[" + this.initiator + "] ", t);
        console.log((new Error()).stack);
        // if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "error", t);
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
        if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "error", arguments);
    }

    info(args)
    {
        console.error("[" + this.initiator + "]", ...arguments);
        if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "info", arguments);
    }

    warn(args)
    {
        console.warn("[" + this.initiator + "]", ...arguments);
        // console.log((new Error()).stack);
        if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "warn", arguments);
    }

    verbose()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
        if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "verbose", arguments);
    }

    log(args)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.shouldPrint(this.initiator, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
        if (window.gui) window.gui.emitEvent("coreLogEvent", this.initiator, "log", arguments);
    }

    userInteraction(text)
    {
        // this.log({ "initiator": "userinteraction", "text": text });
    }
}
