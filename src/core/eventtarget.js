const EventTarget = function ()
{
    this._eventCallbacks = {};

    this.on = this.addEventListener = function (which, cb)
    {
        if (!this._eventCallbacks[which]) this._eventCallbacks[which] = [cb];
        else this._eventCallbacks[which].push(cb);
    };

    this.hasEventListener = function (which, cb)
    {
        if (which && cb)
        {
            if (this._eventCallbacks[which])
            {
                var idx = this._eventCallbacks[which].indexOf(cb);
                if (idx == -1) return false;
                return true;
            }
        }
        else
        {
            Log.warn("hasListener: missing parameters");
        }
    };

    this.removeEventListener = function (which, cb)
    {
        if (this._eventCallbacks[which])
        {
            var idx = this._eventCallbacks[which].indexOf(cb);
            if (idx == -1) Log.warn("eventlistener " + which + " not found...");
            else this._eventCallbacks[which].splice(idx);
        }
    };

    this.emitEvent = function (which, param1, param2, param3, param4, param5, param6)
    {
        if (this._eventCallbacks[which])
        {
            for (var i = 0; i < this._eventCallbacks[which].length; i++)
            {
                if (this._eventCallbacks[which][i])
                {
                    this._eventCallbacks[which][i](param1, param2, param3, param4, param5, param6);
                }
            }
        }
        else
        {
            // Log.warn("has no event callback",which,this._eventCallbacks);
        }
    };
};
export { EventTarget };
