
/**
 * @name Port
 * @memberof CABLES
 * @class
 */

/**
 * change listener for input value ports 
 * @name CABLES.Port#onChange
 * @type Function
 */

CABLES.PORT_DIR_IN=0;
CABLES.PORT_DIR_OUT=1;

var CABLES=CABLES || {};

CABLES.Port=function(__parent,name,type,uiAttribs)
{
    this.data = {}; // reserved for port-specific user-data
    /**
     * @type {number}
     * @name CABLES.Port#direction
     * @description direction of port (input(0) or output(1))
     */
    this.direction=CABLES.PORT_DIR_IN;
    this.id=CABLES.generateUUID();
    this.parent=__parent;

    /**
     * @type {Array<CABLES.Link>}
     * @name CABLES.Port#links
     * @description links of port
     */
    this.links=[];
    this.value=0.0;
    this.name=name;
    this.type=type || CABLES.OP_PORT_TYPE_VALUE;
    this.uiAttribs=uiAttribs || {};
    this.anim=null;
    var oldAnimVal=-5711;
    this.onLink=null;
    this.defaultValue=null;

    this._uiActiveState=true;
    this.ignoreValueSerialize=false;
    this.onLinkChanged=null;
    this.crashed=false;

    this._valueBeforeLink=null;
    this._lastAnimFrame=-1;
    this._animated=false;

    this.onValueChanged=null;
    this.onTriggered=null;
    this.onUiActiveStateChange=null;
    this.changeAlways=false;

    this._warnedDeprecated=false;
    
    this.onUiAttrChange=null;

    Object.defineProperty(this, 'val', {
        get: function() {
            this._warnedDeprecated=true;
            return this.get();
        },
        set: function(v) {
            this.setValue(v);
            // if(!this._warnedDeprecated)console.log('deprecated .val set used',this.parent.name);
            this._warnedDeprecated=true;
        }
      });
};
{
    CABLES.Port.prototype.onAnimToggle=function(){};
    CABLES.Port.prototype._onAnimToggle=function(){this.onAnimToggle();};

    /**
     * @name CABLES.Port#hidePort
     * @function
     * @description hide port rectangle in op
     */
    CABLES.Port.prototype.hidePort=function()
    {
        this.setUiAttribs({hidePort:true});
    };

    /**
     * @name CABLES.Port#remove
     * @function
     * @description remove port
     */
    CABLES.Port.prototype.remove=function()
    {
        // this.setUiAttribs({hidePort:true});
        this.removeLinks();
        this.parent.removePort(this);
    };

    /**
     * @name CABLES.Port#setUiAttribs
     * @function
     * @param {Object} newAttribs
     * @description set ui attributes
     */
    CABLES.Port.prototype.setUiAttribs=function(newAttribs)
    {
        if(!this.uiAttribs)this.uiAttribs={};
        for(var p in newAttribs)
        {
            this.uiAttribs[p]=newAttribs[p];
        }
        if(this.onUiAttrChange) this.onUiAttrChange(newAttribs);
    };

    /**
     * @name CABLES.Port#get
     * @function
     * @description get value of port
     */
    CABLES.Port.prototype.get=function()
    {
        if(this._animated && this._lastAnimFrame!=this.parent.patch.getFrameNum())
        {
            this._lastAnimFrame=this.parent.patch.getFrameNum();
            this.value=this.anim.getValue(this.parent.patch.timer.getTime());

            // if(oldAnimVal!=this.value)
            {
                oldAnimVal=this.value;
                this.forceChange();
            }
        }

        return this.value;
    };

    /**
     * @function
     * @name CABLES.Port#setValue
     * @description set value of port / will send value to all linked ports (only for output ports)
     */
    CABLES.Port.prototype.set=CABLES.Port.prototype.setValue=function(v)
    {
        if(v===undefined)return;

        if(this.parent.enabled && !this.crashed)
        {
            if(v!=this.value || this.changeAlways || this.type==CABLES.OP_PORT_TYPE_TEXTURE || this.type==CABLES.OP_PORT_TYPE_ARRAY )
            {
                if(this._animated)
                {
                    this.anim.setValue(this.parent.patch.timer.getTime(),v);
                }
                else
                {
                    try
                    {
                        this.value=v;
                        this.forceChange();
                    }
                    catch(ex)
                    {
                        this.crashed=true;
                        this.setValue=function(v){};
                        this.onTriggered=function(){};

                        console.log('exception!');
                        console.error('onvaluechanged exception cought',ex);
                        console.log(ex.stack);
                        console.log('exception in: '+this.parent.name);
                        gui.showOpCrash(this.parent);

                        if(CABLES.UI) CABLES.UI.MODAL.showException(ex,this.parent);
                    }

                    if(CABLES.UI && this.type==CABLES.OP_PORT_TYPE_TEXTURE )
                    {
                        gui.texturePreview().updateTexturePort(this);
                    }
                }

                if(this.direction==CABLES.PORT_DIR_OUT)
                    for (var i = 0; i < this.links.length; ++i)
                        this.links[i].setValue();
            }
        }
    };

    CABLES.Port.prototype.updateAnim=function()
    {
        if(this._animated)
        {
            this.value=this.get();

            if(oldAnimVal!=this.value || this.changeAlways)
            {
                oldAnimVal=this.value;
                this.forceChange();
            }
            oldAnimVal=this.value;
        }
    };

    CABLES.Port.prototype.forceChange=function()
    {
        if(this.onChange) this.onChange(this,this.value);
            else if(this.onValueChanged) this.onValueChanged(this,this.value); // deprecated
    };

    /**
     * @function
     * @name CABLES.Port#getTypeString
     * @description get port type as string, e.g. "Function","Value"...
     * @return {string} type
     */
    CABLES.Port.prototype.getTypeString=function()
    {
        if(this.type==CABLES.OP_PORT_TYPE_VALUE)return 'Value';
        else if(this.type==CABLES.OP_PORT_TYPE_FUNCTION)return 'Function';
        else if(this.type==CABLES.OP_PORT_TYPE_OBJECT)return 'Object';
        else if(this.type==CABLES.OP_PORT_TYPE_DYNAMIC)return 'Dynamic';
        else if(this.type==CABLES.OP_PORT_TYPE_ARRAY)return 'Array';
        else return 'Unknown';
    };

    CABLES.Port.prototype.getSerialized=function()
    {
        var obj={};
        obj.name=this.getName();

        if(!this.ignoreValueSerialize && this.links.length===0 )
        {
            if(this.type==CABLES.OP_PORT_TYPE_OBJECT && this.value && this.value.tex){}
                else obj.value=this.value;
        }
        if(this._animated) obj.animated=true;
        if(this.anim) obj.anim=this.anim.getSerialized();
        if(this.uiAttribs.display=='file')  obj.display=this.uiAttribs.display;
        if(this.direction==CABLES.PORT_DIR_IN && this.links.length>0)
        {
            obj.links=[];
            for(var i in this.links)
            {
                if( this.links[i].portIn && this.links[i].portOut)
                    obj.links.push( this.links[i].getSerialized() );
            }
        }
        return obj;
    };

    CABLES.Port.prototype.shouldLink=function(){return true;};

    /**
     * @function
     * @name CABLES.Port#removeLinks
     * @description remove all links from port
     */
    CABLES.Port.prototype.removeLinks=function()
    {
        while(this.links.length>0)
        {
            this.links[0].remove();
        }
    };

    /**
     * @function
     * @name CABLES.Port#removeLink
     * @description remove all link from port
     * @param {CABLES.Link} link
     */
    CABLES.Port.prototype.removeLink=function(link)
    {
        for(var i in this.links)
            if(this.links[i]==link)
            {
                this.links.splice( i, 1 );
            }


        if(this.direction==CABLES.PORT_DIR_IN)
        {
            if(this.type==CABLES.OP_PORT_TYPE_VALUE) this.setValue(this._valueBeforeLink || 0);
                else this.setValue(this._valueBeforeLink || null);
        }

        if(this.onLinkChanged)this.onLinkChanged();
    };

    /**
     * @function
     * @name CABLES.Port#getName
     * @description return port name
     */
    CABLES.Port.prototype.getName= function()
    {
        return this.name;
    };

    CABLES.Port.prototype.addLink=function(l)
    {
        this._valueBeforeLink=this.value;

        this.links.push(l);
        if(this.onLinkChanged)this.onLinkChanged();
    };

    /**
     * @function
     * @name CABLES.Port#getLinkTo
     * @param {CABLES.Port} otherPort
     * @description return link, which is linked to otherPort
     */
    CABLES.Port.prototype.getLinkTo=function(p2)
    {
        for(var i in this.links)
            if(this.links[i].portIn==p2 || this.links[i].portOut==p2)
                return this.links[i];
    };

    /**
     * @function
     * @name CABLES.Port#removeLinkTo
     * @param {CABLES.Port} otherPort
     * @description removes link, which is linked to otherPort
     */
    CABLES.Port.prototype.removeLinkTo=function(p2)
    {
        for(var i in this.links)
            if(this.links[i].portIn==p2 || this.links[i].portOut==p2)
            {
                this.links[i].remove();
                if(this.onLinkChanged)this.onLinkChanged();
                return;
            }
    };

    /**
     * @function
     * @name CABLES.Port#isLinkedTo
     * @param {CABLES.Port} otherPort
     * @description returns true if port is linked to otherPort
     */
    CABLES.Port.prototype.isLinkedTo=function(p2)
    {
        for(var i in this.links)
            if(this.links[i].portIn==p2 || this.links[i].portOut==p2)return true;

        return false;
    };

    /**
     * @name CABLES.Port#trigger
     * @function
     * @description trigger the linked port (usually invoked on an output function port)
     */
    CABLES.Port.prototype.trigger=function()
    {
        if(this.links.length===0)return;
        if(!this.parent.enabled)return;

        var portTriggered=null;
        try
        {
            for (var i = 0; i < this.links.length; ++i)
            {
                if(this.links[i].portIn)
                {
                    portTriggered=this.links[i].portIn;
                    portTriggered._onTriggered();
                }
                this.links[i].activity();
            }
        }
        catch(ex)
        {
            this.parent.enabled=false;

            if(CABLES.UI) CABLES.UI.MODAL.showException(ex,portTriggered.parent);

            
            gui.showOpCrash(portTriggered.parent);

            console.log('exception!');
            console.error('ontriggered exception cought',ex);
            console.log(ex.stack);
            console.log('exception in: '+portTriggered.parent.name);
        }
    };

    CABLES.Port.prototype.call=function()
    {
        console.log('call deprecated - use trigger() ');
        this.trigger();
    };

    CABLES.Port.prototype.execute=function()
    {
        console.log('### execute port: '+this.getName() , this.goals.length);
    };

    CABLES.Port.prototype.setAnimated=function(a)
    {
        if(this._animated!=a)
        {
            this._animated=a;
            if(this._animated && !this.anim)this.anim=new CABLES.TL.Anim();
            this._onAnimToggle();
        }
    };

    CABLES.Port.prototype.toggleAnim=function(val)
    {
        this._animated=!this._animated;
        if(this._animated && !this.anim)this.anim=new CABLES.TL.Anim();
        this.setAnimated(this._animated);
        this._onAnimToggle();
    };

    /**
     * @function
     * @name CABLES.Port#getType
     * @return {number} type
     * @description return type of port
     */
    CABLES.Port.prototype.getType=function(){ return this.type; };

    /**
     * @function
     * @name CABLES.Port#getType
     * @return {number} 
     * @description return true if port is linked
     */
    CABLES.Port.prototype.isLinked=function(){ return this.links.length>0; };

    /**
     * @function
     * @name CABLES.Port#isAnimated
     * @return {boolean}
     * @description return true if port is animated
     */
    CABLES.Port.prototype.isAnimated=function()
    {
        return this._animated;
    };


    /**
     * @function
     * @name CABLES.Port#isHidden
     * @return {boolean}
     * @description return true if port is hidden
     */
    CABLES.Port.prototype.isHidden=function()
    {
        return this.uiAttribs.hidePort;
    };
    

    /**
     * @function
     * @name CABLES.Port#onTriggered
     * @param {function} callback
     * @description set callback, which will be executed when port was triggered (usually output port)
     */
    CABLES.Port.prototype._onTriggered=function()
    {
        this.parent.updateAnims();
        if(this.parent.enabled && this.onTriggered) this.onTriggered();
    };

    CABLES.Port.prototype._onTriggeredProfiling=function()
    {
        this.parent.updateAnims();
        this.parent.patch.profiler.add("port",this);

        if(this.parent.enabled && this.onTriggered) this.onTriggered();
        this.parent.patch.profiler.add("port",null);
    };

    CABLES.Port.prototype.onValueChange=function(cb)
    {
        // deprecated
        this.onChange=cb;
    };

    CABLES.Port.prototype.getUiActiveState=function()
    {
        return this._uiActiveState;
    };

    CABLES.Port.prototype.setUiActiveState=function(onoff)
    {
        _uiActiveState=onoff;
        if(this.onUiActiveStateChange)this.onUiActiveStateChange();
    };
}

/**
* Returns the port type string, e.g. "value" based on the port type number
* @param {number} type - The port type number
* @returns {string} - The port type as string
*/
CABLES.Port.portTypeNumberToString = function(type) {
   if(type == CABLES.OP_PORT_TYPE_VALUE) return 'value';
   else if(type == CABLES.OP_PORT_TYPE_FUNCTION) return 'function';
   else if(type == CABLES.OP_PORT_TYPE_OBJECT) return 'object';
   else if(type == CABLES.OP_PORT_TYPE_ARRAY) return 'array';
   else if(type == CABLES.OP_PORT_TYPE_DYNAMIC) return 'dynamic';
   else return 'unknown';
};

// var Port = CABLES.Port; // TODO deprecated.. remove one day...
