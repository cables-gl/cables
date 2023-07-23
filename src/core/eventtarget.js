import Logger from "./core_logger";

const EventTarget = function ()
{
    this._log = new Logger("eventtaget");
    this._eventCallbacks = {};
    this._logName = "";
    this._logEvents = false;
    this._listeners = {};
    CABLES.eventTargetProfile = CABLES.eventTargetProfile || {};

    this.addEventListener = this.on = function (which, cb, idPrefix)
    {
        const event =
        {
            "id": (idPrefix || "") + CABLES.simpleId(),
            "name": which,
            "cb": cb,
        };
        if (!this._eventCallbacks[which]) this._eventCallbacks[which] = [event];
        else this._eventCallbacks[which].push(event);

        this._listeners[event.id] = event;

        return event.id;
    };

    this.hasEventListener = function (which, cb)
    {
        if (which && !cb)
        {
            // check by id
            if (this._listeners[which]) return true;
            else return false;
        }
        else
        {
            this._log.warn("old eventtarget function haseventlistener!");
            if (which && cb)
            {
                if (this._eventCallbacks[which])
                {
                    const idx = this._eventCallbacks[which].indexOf(cb);
                    if (idx == -1) return false;
                    return true;
                }
            }
        }
    };

    this.removeEventListener = this.off = function (which, cb)
    {
        if (which === null || which === undefined) return;

        if (!cb) // new style, remove by id, not by name/callback
        {
            const event = this._listeners[which];
            if (!event)
            {
                console.log("could not find event...");
                return;
            }

            let found = true;
            while (found)
            {
                found = false;
                let index = -1;
                for (let i = 0; i < this._eventCallbacks[event.name].length; i++)
                {
                    if (this._eventCallbacks[event.name][i].id.indexOf(which) === 0) // this._eventCallbacks[event.name][i].id == which ||
                    {
                        found = true;
                        index = i;
                    }
                }

                if (index !== -1)
                {
                    this._eventCallbacks[event.name].splice(index, 1);
                    delete this._listeners[which];
                }
            }


            return;
        }

        this._log.stack(" old function signature: removeEventListener! use listener id");

        let index = null;
        for (let i = 0; i < this._eventCallbacks[which].length; i++)
            if (this._eventCallbacks[which][i].cb == cb)
                index = i;

        if (index !== null)
        {
            delete this._eventCallbacks[index];
        }
        else this._log.warn("removeEventListener not found " + which);
    };

    this.logEvents = function (enabled, name)
    {
        this._logEvents = enabled;
        this._logName = name;
    };

    this.emitEvent = function (which, param1, param2, param3, param4, param5, param6)
    {
        if (this._logEvents) console.log("[event] ", this._logName, which, this._eventCallbacks); // eslint-disable-line

        if (this._eventCallbacks[which])
        {
            const execCallbacks = [];
            for (let i = 0; i < this._eventCallbacks[which].length; i++)
            {
                if (!execCallbacks[which]) execCallbacks[which] = [];
                execCallbacks[which].push(this._eventCallbacks[which][i]);
            }

            if (execCallbacks[which])
            {
                for (let i = 0; i < execCallbacks[which].length; i++)
                {
                    if (execCallbacks[which][i])
                    {
                        const evName = this.constructor.name + " " + which;
                        CABLES.eventTargetProfile[evName] = (CABLES.eventTargetProfile[evName] || { "name": this.constructor.name, "event": which, "count": 0 });
                        CABLES.eventTargetProfile[evName].active = this._eventCallbacks[which].length;
                        CABLES.eventTargetProfile[evName].count++;

                        execCallbacks[which][i].cb(param1, param2, param3, param4, param5, param6);
                    }
                }
            }
        }
        else
        {
            if (this._logEvents) console.log("[event] has no event callback", which, this._eventCallbacks); // eslint-disable-line
        }
    };
};

export { EventTarget };
