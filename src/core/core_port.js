var PORT_DIR_IN=0;
var PORT_DIR_OUT=1;

var CABLES=CABLES || {};

CABLES.Port=function(__parent,name,type,uiAttribs)
{
    this.direction=PORT_DIR_IN;
    this.id=CABLES.generateUUID();
    this.parent=__parent;
    this.links=[];
    this.value=0.0;
    this.name=name;
    this.type=type || OP_PORT_TYPE_VALUE;
    this.uiAttribs=uiAttribs || {};
    this.anim=null;
    var oldAnimVal=-5711;
    this.onLink=null;
    this.defaultValue=null;

    this._uiActiveState=true;
    this.ignoreValueSerialize=false;
    this.onLinkChanged=null;
    this.crashed=true;

    this._valueBeforeLink=null;
    this._lastAnimFrame=-1;
    this._animated=false;

    this.onValueChanged=null;
    this.onTriggered=null;
    this.onUiActiveStateChange=null;
    this.changeAlways=false;

    this._warnedDeprecated=false;
};
{
    CABLES.Port.prototype.onAnimToggle=function(){};
    CABLES.Port.prototype._onAnimToggle=function(){this.onAnimToggle();};

    CABLES.Port.prototype.__defineGetter__("val", function()
    {
        // if(!this._warnedDeprecated) console.log('deprecated .val get used',this.parent.name);
        this._warnedDeprecated=true;
        return this.get();
    });

    CABLES.Port.prototype.__defineSetter__("val", function(v)
    {
        this.setValue(v);
        // if(!this._warnedDeprecated)console.log('deprecated .val set used',this.parent.name);
        this._warnedDeprecated=true;
    });

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


    CABLES.Port.prototype.set=CABLES.Port.prototype.setValue=function(v)
    {

        if(v===undefined)return;

        if(this.parent.enabled)
        {
            if(v!=this.value || this.changeAlways || this.type==OP_PORT_TYPE_TEXTURE || this.type==OP_PORT_TYPE_ARRAY)
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

                        if(CABLES.UI) CABLES.UI.MODAL.showException(ex,this.parent);
                    }
                }

                if(this.direction==PORT_DIR_OUT)
                    for (var i = 0; i < this.links.length; ++i)
                        this.links[i].setValue();
            }
        }
    };

    CABLES.Port.prototype.updateAnim=function()
    {
        if(this._animated)
        {
            this.value=this.get();//this.anim.getValue(parent.patch.timer.getTime());

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

    CABLES.Port.prototype.getTypeString=function()
    {
        if(this.type==OP_PORT_TYPE_VALUE)return 'Value';
        else if(this.type==OP_PORT_TYPE_FUNCTION)return 'Function';
        else if(this.type==OP_PORT_TYPE_OBJECT)return 'Object';
        else if(this.type==OP_PORT_TYPE_DYNAMIC)return 'Dynamic';
        else if(this.type==OP_PORT_TYPE_ARRAY)return 'Array';
        else return 'Unknown';
    };

    CABLES.Port.prototype.getSerialized=function()
    {
        var obj={};
        obj.name=this.getName();

        if(!this.ignoreValueSerialize && this.links.length===0)
        {
            obj.value=this.value;
        }

        if(this._animated) obj.animated=true;
        if(this.anim) obj.anim=this.anim.getSerialized();

        if(this.direction==PORT_DIR_IN && this.links.length>0)
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

    CABLES.Port.prototype.removeLinks=function()
    {
        while(this.links.length>0)
        {
            this.links[0].remove();
        }

    };

    CABLES.Port.prototype.removeLink=function(link)
    {
        for(var i in this.links)
            if(this.links[i]==link)this.links.splice( i, 1 );

        if(this.direction==PORT_DIR_IN)
        {
            if(this.type==OP_PORT_TYPE_VALUE) this.setValue(this._valueBeforeLink || 0);
                else this.setValue(this._valueBeforeLink || null);
        }

        if(this.onLinkChanged)this.onLinkChanged();
    };

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

    CABLES.Port.prototype.getLinkTo=function(p2)
    {
        for(var i in this.links)
            if(this.links[i].portIn==p2 || this.links[i].portOut==p2)
                return this.links[i];
    };


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

    CABLES.Port.prototype.isLinkedTo=function(p2)
    {
        for(var i in this.links)
            if(this.links[i].portIn==p2 || this.links[i].portOut==p2)return true;

        return false;
    };

    CABLES.Port.prototype.trigger=function()
    {
        if(this.links.length===0)return;
        if(!this.parent.enabled)return;

        try
        {
            for (var i = 0; i < this.links.length; ++i)
            {
                if(this.links[i].portIn)
                {
                    this.links[i].portIn._onTriggered();
                }
                this.links[i].activity();
                // console.log(1);

            }
        }
        catch(ex)
        {
            this.parent.enabled=false;

            if(CABLES.UI) CABLES.UI.MODAL.showException(ex,this.parent);

            console.log('exception!');
            console.error('ontriggered exception cought',ex);
            console.log(ex.stack);
            console.log('exception in: '+this.parent.name);
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
    CABLES.Port.prototype.getType=function(){ return this.type; };
    CABLES.Port.prototype.isLinked=function(){ return this.links.length>0; };

    CABLES.Port.prototype.isAnimated=function()
    {
        return this._animated;
    };

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

var Port = CABLES.Port; // TODO deprecated.. remove one day...
