
var CABLES=CABLES||{};

CABLES.EventTarget=function()
{
    this._eventCallbacks={};

    this.addEventListener=function(which,cb)
    {
        if(!this._eventCallbacks[which]) this._eventCallbacks[which]=[cb];
            else this._eventCallbacks[which].push(cb);
    }

    this.hasEventListener=function(which,cb)
    {
        if(which && cb)
        {
            if(this._eventCallbacks[which])
            {
                var idx=this._eventCallbacks[which].indexOf(cb);
                if(idx==-1) return false;
                else return true;
            }
        }
        else
        {
            console.log("hasListener: missing parameters")
        }
    }


    /**
     * @function
     * @description remove an eventlistener
     * @param {which} name of event
     * @param {function} callback
     */
    this.removeEventListener=function(which,cb)
    {
        if(this._eventCallbacks[which])
        {
            var idx=this._eventCallbacks[which].indexOf(cb);
            if(idx==-1) console.log("eventlistener "+which+" not found...");
            else this._eventCallbacks[which].slice(idx);
        }
    }

    this.emitEvent=function(which,params)
    {
        if(this._eventCallbacks[which])
            for(var i=0;i<this._eventCallbacks[which].length;i++)
                if(this._eventCallbacks[which])this._eventCallbacks[which][i](params);

    }

}

