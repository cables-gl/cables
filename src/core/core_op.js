/**
 * @name Op
 * @memberof CABLES
 * @class
 */
var Ops = {};
var CABLES=CABLES || {};

/**
 * current CGL Context 
 * @name CABLES.Op#cgl
 * @type CGL.Context
 * @readonly
 */
CABLES.OP_PORT_TYPE_VALUE = 0;
CABLES.OP_PORT_TYPE_FUNCTION = 1;
CABLES.OP_PORT_TYPE_OBJECT = 2;
CABLES.OP_PORT_TYPE_TEXTURE = 2;
CABLES.OP_PORT_TYPE_ARRAY = 3;
CABLES.OP_PORT_TYPE_DYNAMIC = 4;
CABLES.OP_PORT_TYPE_STRING = 5;

CABLES.OP_VERSION_PREFIX = '_v';

/**
 * CABLES.Op
 * @class
 */
CABLES.Op = function()
{
    this.data={}; // reserved for op-specific user-data
    this.objName='';
    this.portsOut=[];
    this.portsIn=[];
    this.portsInData=[]; // original loaded patch data 
    this.opId=''; // unique op id
    this.uiAttribs = {};
    this.enabled=true;
    this.patch=arguments[0];
    this.name=arguments[1];
    this.errors={};
    this._needsLinkedToWork=[];
    this._needsParentOp=null;

    if(this.name)
    {
        this.name=this.name.split('.')[this.name.split('.').length-1]

        if(this.name.indexOf(CABLES.OP_VERSION_PREFIX)>0)
        {
            var n=this.name.split(CABLES.OP_VERSION_PREFIX)[1]
            this.name=this.name.substring(0,this.name.length - (CABLES.OP_VERSION_PREFIX+n).length);
        }
    }
    // this.name=this.name.split('.')[this.name.split('.').length-1]
    // const a=this.name.substring(this.name.length - 1, this.name.length);
    // const b=this.name.substring(this.name.length - 2, this.name.length-1);
    // if(CABLES.UTILS.isNumeric(a) && !CABLES.UTILS.isNumeric(b)) this.name=this.name.substring(0,this.name.length - 1);
    //     else if(CABLES.UTILS.isNumeric(a) && CABLES.UTILS.isNumeric(b)) this.name=this.name.substring(0,this.name.length - 2);

    this.id=arguments[2]||CABLES.uuid(); // instance id
    this.onAddPort=null;
    this.onCreate=null;
    this.onResize=null;
    this.onLoaded=null;
    this.onDelete=null;
    this.onUiAttrChange=null;
    this._eventCallbacks={};
    this._instances=null;

    /**
     * overwrite this to prerender shader and meshes / will be called by op `loadingStatus`
     * @name CABLES.Op#preRender
     * @function
     */
    this.preRender=null;

    /**
     * overwrite this to initialize your op
     * @name CABLES.Op#init
     * @function
     */
    this.init=null;
};

{
    CABLES.Op.prototype.clearUiAttrib=function(name)
    {
        var obj={};
        obj.name=null;
        this.uiAttrib(obj);
    };

    CABLES.Op.prototype.setTitle=function(name)
    {
        var doFireEvent=this.name!=name;

        this.name=name;
        this.uiAttr({title:name});

        if(doFireEvent) 
            this.fireEvent("onTitleChange",name);
    };

    CABLES.Op.prototype.setUiAttrib=CABLES.Op.prototype.uiAttr=function(newAttribs)
    {
        if(!this.uiAttribs)this.uiAttribs={};
        for(var p in newAttribs)
        {
            this.uiAttribs[p]=newAttribs[p];
        }
        
        // if(this.onUiAttrChange) this.onUiAttrChange(newAttribs);
        this.fireEvent("onUiAttribsChange",newAttribs);
    };

    CABLES.Op.prototype.getName=function()
    {
        return this.name;
    };

    CABLES.Op.prototype.addOutPort=function(p)
    {
        p.direction=CABLES.PORT_DIR_OUT;
        p.parent=this;
        this.portsOut.push(p);
        if(this.onAddPort)this.onAddPort(p);
        // this.fireEvent("onPortsChanged",{});
        return p;
    };

    CABLES.Op.prototype.hasPort=function(name)
    {
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
            if(this.portsIn[i].getName()==name)
                return true;
        return false;
    };

    CABLES.Op.prototype.hasDynamicPort=function()
    {
        var i=0;
        for(i=0;i<this.portsIn.length;i++)
        {
            if(this.portsIn[i].type==CABLES.OP_PORT_TYPE_DYNAMIC) return true;
            if(this.portsIn[i].getName()=='dyn') return true;
        }
        for(i=0;i<this.portsOut.length;i++)
        {
            if(this.portsOut[i].type==CABLES.OP_PORT_TYPE_DYNAMIC) return true;
            if(this.portsOut[i].getName()=='dyn') return true;
        }

        return false;
    };

    CABLES.Op.prototype.addInPort=function(p)
    {
        if( !(p instanceof CABLES.Port))
        {
            throw new Error("parameter is not a port!");
            return;
        }
        p.direction=CABLES.PORT_DIR_IN;
        p.parent=this;
        this.portsIn.push(p);
        if(this.onAddPort)this.onAddPort(p);
        // this.fireEvent("onPortsChanged",{});
        return p;
    };

    /**
     * create a trigger input port
     * @name CABLES.Op#inTrigger
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inFunction= // deprecated
    CABLES.Op.prototype.inTrigger=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_FUNCTION)); if(v!==undefined)p.set(v); return p; };

    /**
     * create a trigger input  port with an UI trigger button
     * @name CABLES.Op#inTriggerButton
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inFunctionButton=  // deprecated
    CABLES.Op.prototype.inTriggerButton=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_FUNCTION,{"display":"button"})); if(v!==undefined)p.set(v); return p; };

    /**
     * create a number value input port
     * @name CABLES.Op#inValue
     * @param {string} name
     * @param {Boolean} value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueFloat=CABLES.Op.prototype.inValue=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE)); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    /**
     * create a boolean input port, displayed as a checkbox
     * @name CABLES.Op#inValueBool
     * @param {string} name
     * @param {Boolean} value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueBool=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"display":"bool"})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    /**
     * create a String value input port
     * @name CABLES.Op#inValueString
     * @param {string} name
     * @param {string} value default value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueString = function (name, v) { var p = this.addInPort(new CABLES.Port(this, name, CABLES.OP_PORT_TYPE_VALUE, { "type": "string" })); p.value = ''; if (v !== undefined) { p.set(v); p.defaultValue = v; } return p; };

    // new string
    CABLES.Op.prototype.inString = function (name, v) { var p = this.addInPort(new CABLES.Port(this, name, CABLES.OP_PORT_TYPE_STRING, { "type": "string" }));  v=v||''; p.value = v; p.set(v); p.defaultValue = v; return p; };
    


    /**
     * create a String value input port displayed as TextArea
     * @name CABLES.Op#inValueText
     * @param {string} name
     * @param {string} value default value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueText=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"type":"string","display":"text"})); p.value=''; if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };
    
    /**
     * create a String value input port displayed as editor
     * @name CABLES.Op#inValueEditor
     * @param {string} name
     * @param {string} value default value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueEditor=function(name,v,syntax){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"type":"string",display:'editor',editorSyntax:syntax})); p.value=''; if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };
    
    // new string
    CABLES.Op.prototype.inStringEditor = function (name, v, syntax) { var p = this.addInPort(new CABLES.Port(this, name, CABLES.OP_PORT_TYPE_STRING, { "type": "string", display: 'editor', editorSyntax: syntax })); p.value = ''; if (v !== undefined) { p.set(v); p.defaultValue = v; } return p; };

    /**
     * create a string select box
     * @name CABLES.Op#inValueSelect
     * @param {string} name
     * @param {Array} values
     * @param {string} value default value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueSelect=function(name,values,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"display":'dropdown',"hidePort":true,values:values})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    /**
     * create a integer input port
     * @name CABLES.Op#inValueInt
     * @param {string} name
     * @param {number} value default value
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueInt=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"increment":'integer'})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    /**
     * create a file input port
     * @name CABLES.Op#inFile
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inFile=function(name,filter,v){var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"display":"file","filter":filter})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    /**
     * @function
     * create a texture input port
     * @name CABLES.Op#inTexture
     * @param {string} name
     * @return {CABLES.Port}
     */
    CABLES.Op.prototype.inTexture=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_OBJECT,{"display":"texture","preview":true})); if(v!==undefined)p.set(v); return p; };

    /**
     * create a object input port
     * @name CABLES.Op#inObject
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inObject=function(name,v,options) { var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_OBJECT,options)); if(v!==undefined)p.set(v); return p; };

    CABLES.Op.prototype.inGradient=function(name,v) { var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"display":"gradient","hidePort":true})); if(v!==undefined)p.set(v); return p; };

    /**
     * create a array input port
     * @name CABLES.Op#inObject
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inArray=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_ARRAY)); if(v!==undefined)p.set(v); return p; };

    /**
     * create a value slider input port
     * @name CABLES.Op#inValueSlider
     * @param {string} name
     * @param {number} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.inValueSlider=function(name,v){ var p=this.addInPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{'display':'range'})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };


    /**
     * create output trigger port
     * @name CABLES.Op#outTrigger
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outFunction=CABLES.Op.prototype.outTrigger=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_FUNCTION)); if(v!==undefined)p.set(v); return p; };

    /**
     * create output value port
     * @name CABLES.Op#outValue
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outValue=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE)); if(v!==undefined)p.set(v); return p; };

    /**
     * create output boolean port
     * @name CABLES.Op#outValueBool
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outValueBool=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_VALUE,{"display":"bool"})); if(v!==undefined)p.set(v);else p.set(false); return p; };

    /**
     * create output string port
     * @name CABLES.Op#outValueString
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outValueString = function (name, v) { var p = this.addOutPort(new CABLES.Port(this, name, CABLES.OP_PORT_TYPE_VALUE, { "type": "string" })); if (v !== undefined) p.set(v); return p; };
    CABLES.Op.prototype.outString = function (name, v) { var p = this.addOutPort(new CABLES.Port(this, name, CABLES.OP_PORT_TYPE_STRING, { "type": "string" })); if (v !== undefined) p.set(v); else p.set(''); return p; };

    /**
     * create output object port
     * @name CABLES.Op#outObject
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outObject=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_OBJECT)); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };

    /**
     * create output array port
     * @name CABLES.Op#outArray
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outArray=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_ARRAY)); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };

    /**
     * create output texture port
     * @name CABLES.Op#outTexture
     * @param {string} name
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.outTexture=function(name,v){ var p=this.addOutPort(new CABLES.Port(this,name,CABLES.OP_PORT_TYPE_OBJECT,{"preview":true})); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };


    CABLES.Op.prototype.inDynamic=
        function(name,filter,options,v){
            var p=new CABLES.Port( this,name,CABLES.OP_PORT_TYPE_DYNAMIC,options);

            p.shouldLink=function(p1,p2)
            {
              if(filter && CABLES.UTILS.isArray(filter))
              {
                for(var i=0; i<filter.length; i++)
                {
                  if(p1==this && p2.type===filter[i]) return true;
                  if(p2==this && p1.type===filter[i]) return true;
                }
                return false; // types do not match
              } else {
                return true; // no filter set
              }
            };

            this.addInPort(p); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p;
        };

    CABLES.Op.prototype.printInfo=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
            console.log('in: '+this.portsIn[i].getName());

        for(var ipo in this.portsOut)
            console.log('out: '+this.portsOut[ipo].getName());
    };

    CABLES.Op.prototype.getOutChilds=function()
    {
        var childs=[];
        for(var ipo in this.portsOut)
        {
            for(var l in this.portsOut[ipo].links)
            {
                if(this.portsOut[ipo].type==CABLES.OP_PORT_TYPE_FUNCTION)
                    childs.push(this.portsOut[ipo].links[l].portIn.parent);
            }
        }
        return childs;
    };

    CABLES.Op.prototype.markChilds=function()
    {
        this.marked=true;
        for(var ipo in this.portsOut)
        {
            for(var l in this.portsOut[ipo].links)
            {
                this.portsOut[ipo].parent.marked=true;
                if(this.portsOut[ipo].links[l].portIn.parent!=this) this.portsOut[ipo].links[l].portIn.parent.markChilds();
            }
        }
    };

    CABLES.Op.prototype.deleteChilds=function()
    {
        var opsToDelete=[];
        for(var ipo in this.portsOut)
        {
            for(var l in this.portsOut[ipo].links)
            {
                if(this.portsOut[ipo].links[l].portIn.parent!=this)
                {
                    if(this.portsOut[ipo].parent!=this) opsToDelete.push(this.portsOut[ipo].parent);
                    opsToDelete.push(this.portsOut[ipo].links[l].portIn.parent);
                    this.portsOut[ipo].links[l].portIn.parent.deleteChilds();
                }
            }
        }

        for(var i in opsToDelete)
        {
            this.patch.deleteOp(opsToDelete[i].id);
        }
    };

    CABLES.Op.prototype.removeLinks=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
            this.portsIn[i].removeLinks();

        for(var ipo in this.portsOut)
            this.portsOut[ipo].removeLinks();
    };

    CABLES.Op.prototype.countFittingPorts=function(otherPort)
    {
        var count=0;
        for(var ipo in this.portsOut)
            if(CABLES.Link.canLink(otherPort,this.portsOut[ipo]))count++;

        for(var ipi in this.portsIn)
            if(CABLES.Link.canLink(otherPort,this.portsIn[ipi]))count++;

        return count;
    };

    CABLES.Op.prototype.findFittingPort=function(otherPort)
    {
        for(var ipo in this.portsOut)
            if(CABLES.Link.canLink(otherPort,this.portsOut[ipo]))return this.portsOut[ipo];

        for(var ipi in this.portsIn)
            if(CABLES.Link.canLink(otherPort,this.portsIn[ipi]))return this.portsIn[ipi];
    };

    CABLES.Op.prototype.getSerialized=function()
    {
        var op={};
        op.name=this.getName();

        var nameParts=this.objName.split('.');
        if(nameParts.length>0) if(op.name==nameParts[nameParts.length-1])delete op.name;

        if(this.opId) op.opId=this.opId;
        op.objName=this.objName; // id opid exists, this should not be needed, but for fallback reasons still here.
        
        op.id=this.id;
        op.uiAttribs=this.uiAttribs;
        op.portsIn=[];
        op.portsOut=[];

        for(var i=0;i<this.portsIn.length;i++) op.portsIn.push(this.portsIn[i].getSerialized());
        for(var ipo in this.portsOut) op.portsOut.push(this.portsOut[ipo].getSerialized());

        return op;
    };

    CABLES.Op.prototype.getFistOutPortByType=function(type)
    {
        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].type==type)return this.portsOut[ipo];
    };

    /**
     * return port by the name portName
     * @name CABLES.Op#getPortByName
     * @param {string} portName
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.getPortByName=function(name)
    {
        // for(var ipi in this.portsIn)
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
            if(this.portsIn[ipi].getName()==name)return this.portsIn[ipi];

        // for(var ipo in this.portsOut)
        for(var ipo=0;ipo<this.portsOut.length;ipo++)
            if(this.portsOut[ipo].getName()==name)return this.portsOut[ipo];
    };

    /**
     * return port by the name id
     * @name CABLES.Op#getPortById
     * @param {string} id
     * @return {CABLES.Port}
     * @function
     */
    CABLES.Op.prototype.getPortById=function(id)
    {
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
            if(this.portsIn[ipi].id==id)return this.portsIn[ipi];

        for(var ipo=0;ipo<this.portsOut.length;ipo++)
            if(this.portsOut[ipo].id==id)return this.portsOut[ipo];
    };

    CABLES.Op.prototype.getPort=function(name)
    {
        return this.getPortByName(name);
    };

    CABLES.Op.prototype.updateAnims=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
            this.portsIn[i].updateAnim();
    };

    CABLES.Op.prototype.log=function()
    {
        if(!this.patch.silent) Function.prototype.apply.apply(console.log, [console, arguments]);
    };

    CABLES.Op.prototype.error=function()
    {
        if(!this.patch.silent) Function.prototype.apply.apply(console.error, [console, arguments]);
    };

    CABLES.Op.prototype.warn=function()
    {
        if(!this.patch.silent) Function.prototype.apply.apply(console.warn, [console, arguments]);
    };

    CABLES.Op.prototype.undoUnLinkTemporary=function()
    {
        if(this.shakeLink)this.shakeLink.remove();
        this.shakeLink=null;

        if(this.oldLinks)
        {
            for(var i=0;i<this.oldLinks.length;i++)
            {
                this.patch.link(
                    this.oldLinks[i].in.parent,
                    this.oldLinks[i].in.getName(),
                    this.oldLinks[i].out.parent,
                    this.oldLinks[i].out.getName()
                    );
            }
            this.oldLinks.length=0;
        }
    };

    CABLES.Op.prototype.unLink=function()
    {
        for(var ipo=0;ipo<this.portsOut.length;ipo++) this.portsOut[ipo].removeLinks();
        for(var ipi=0;ipi<this.portsIn.length;ipi++) this.portsIn[ipi].removeLinks();
    };

    CABLES.Op.unLinkTempReLinkP1=null;
    CABLES.Op.unLinkTempReLinkP2=null;

    CABLES.Op.prototype.unLinkTemporary=function()
    {
        var tryRelink=true;
        var i=0;

        this.shakeLink=null;
        this.oldLinks=[];

        if(tryRelink)
        {
            if(
                (this.portsIn.length>0 && this.portsIn[0].isLinked()) &&
                (this.portsOut.length>0 && this.portsOut[0].isLinked()))
            {
                if(this.portsIn[0].getType()==this.portsOut[0].getType())
                {
                    CABLES.Op.unLinkTempReLinkP1=this.portsIn[0].links[0].getOtherPort(this.portsIn[0]);
                    CABLES.Op.unLinkTempReLinkP2=this.portsOut[0].links[0].getOtherPort(this.portsOut[0]);
                }
            }
        }

        for(var ipi=0;ipi<this.portsIn.length;ipi++)
        {
            for(i=0;i<this.portsIn[ipi].links.length;i++)
                this.oldLinks.push(
                    {
                        in:this.portsIn[ipi].links[i].portIn,
                        out:this.portsIn[ipi].links[i].portOut
                    });
        }

        for(var ipo=0;ipo<this.portsOut.length;ipo++)
        {
            for(i=0;i<this.portsOut[ipo].links.length;i++)
                this.oldLinks.push(
                    {
                        in:this.portsOut[ipo].links[i].portIn,
                        out:this.portsOut[ipo].links[i].portOut
                    });
        }

        this.unLink();

        if(CABLES.Op.unLinkTempReLinkP1 && CABLES.Op.unLinkTempReLinkP2)
        {
            this.shakeLink=this.patch.link(
                CABLES.Op.unLinkTempReLinkP1.parent,
                CABLES.Op.unLinkTempReLinkP1.getName(),
                CABLES.Op.unLinkTempReLinkP2.parent,
                CABLES.Op.unLinkTempReLinkP2.getName()
                );
        }
    };

    CABLES.Op.prototype.profile=function(enable)
    {
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
            this.portsIn[ipi]._onTriggered=this.portsIn[ipi]._onTriggeredProfiling;
    };

    CABLES.Op.prototype.findParent=function(objName)
    {
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
        {
            if(this.portsIn[ipi].isLinked())
            {
                if(this.portsIn[ipi].links[0].portOut.parent.objName==objName)
                    return this.portsIn[ipi].links[0].portOut.parent;
                else
                {
                    var found=null;
                    found=this.portsIn[ipi].links[0].portOut.parent.findParent(objName);
                    if(found) return found;
                }
            }
        }
        return null;
    };

    CABLES.Op.prototype.cleanUp=function()
    {
        if(this._instances)
        {
            for(var i=0;i<this._instances.length;i++)
            {
                if(this._instances[i].onDelete)this._instances[i].onDelete();
            }
            this._instances.length=0;
        }
    };

    CABLES.Op.prototype.instanced=function(triggerPort)
    {
        if(this.patch.instancing.numCycles()===0)return false;

        var i=0;
        var ipi=0;
        if(!this._instances || this._instances.length!=this.patch.instancing.numCycles())
        {
            if(!this._instances)this._instances=[];
            console.log('creating instances of ',this.objName,this.patch.instancing.numCycles(),this._instances.length);
            this._instances.length=this.patch.instancing.numCycles();
            for(i=0;i<this._instances.length;i++)
            {
                this._instances[i]=this.patch.createOp(this.objName,true);
                this._instances[i].instanced=function()
                {
                    return false;
                };
                this._instances[i].uiAttr(this.uiAttribs);

                for(var ipo=0;ipo<this.portsOut.length;ipo++)
                {
                    if(this.portsOut[ipo].type==CABLES.OP_PORT_TYPE_FUNCTION)
                    {
                        this._instances[ i ].getPortByName(this.portsOut[ipo].name).trigger=this.portsOut[ ipo ].trigger.bind(this.portsOut[ipo]);
                    }
                }
            }

            for(ipi=0;ipi<this.portsIn.length;ipi++)
            {
                this.portsIn[ipi].onChange=null;
                this.portsIn[ipi].onValueChanged=null;
            }
        }

        var theTriggerPort=null;
        for(ipi=0;ipi<this.portsIn.length;ipi++)
        {
            if(this.portsIn[ipi].type==CABLES.OP_PORT_TYPE_VALUE || this.portsIn[ipi].type==CABLES.OP_PORT_TYPE_ARRAY)
            {
                this._instances[ this.patch.instancing.index() ].portsIn[ipi].set(this.portsIn[ipi].get());
            }
            if(this.portsIn[ipi].type==CABLES.OP_PORT_TYPE_FUNCTION)
            {
                // console.log(this.patch.instancing.index());
                // console.log(this._instances.length);

                // if(this._instances[ this.patch.instancing.index() ].portsIn[ipi].name==triggerPort.name)
                    // theTriggerPort=this._instances[ this.patch.instancing.index() ].portsIn[ipi];
            }
        }

        if(theTriggerPort)theTriggerPort.onTriggered();

        for(ipi=0;ipi<this.portsOut.length;ipi++)
        {
            if(this.portsOut[ipi].type==CABLES.OP_PORT_TYPE_VALUE)
            {
                this.portsOut[ipi].set(this._instances[ this.patch.instancing.index() ].portsOut[ipi].get());
            }
        }

        return true;
    };

    CABLES.Op.prototype.initInstancable=function()
    {
//         if(this.isInstanced)
//         {
//             console.log('cancel instancing');
//             return;
//         }
//         this._instances=[];
//         for(var ipi=0;ipi<this.portsIn.length;ipi++)
//         {
//             if(this.portsIn[ipi].type==CABLES.OP_PORT_TYPE_VALUE)
//             {
//
//             }
//             if(this.portsIn[ipi].type==CABLES.OP_PORT_TYPE_FUNCTION)
//             {
//                 // var piIndex=ipi;
//                 this.portsIn[ipi].onTriggered=function(piIndex)
//                 {
//
//                     var i=0;
// // console.log('trigger',this._instances.length);
//
//                 }.bind(this,ipi );
//
//             }
        // };
        // this._instances=null;
    };


    CABLES.Op.prototype.setValues=function(obj)
    {
        for(var i in obj)
        {
            var port=this.getPortByName(i);
            if(port) port.set(obj[i]);
                else console.log("op.setValues: port not found:",i);
        }
    };


    /**
     * @function
     * @description show op error message - set message to null to remove error message
     * @param {errorid} id error identifier
     * @param {txt} text message
     */
    CABLES.Op.prototype.error=function(id,txt)
    {
        this.errors[id]=txt;
        if(txt==null) delete this.errors[id];

        var errorHtml='';
        for(var i in this.errors)
        {
            errorHtml+='- '+this.errors[i]+'<br/>';
        }
        this.uiAttr({'error':errorHtml});
    }

    /**
     * @function
     * @description add an eventlistener ot op
     * currently implemented:  "onEnabledChange", "onTitleChange", "onUiAttribsChange"
     * @param {which} name of event
     * @param {function} callback
     */
    CABLES.Op.prototype.addListener=
    CABLES.Op.prototype.addEventListener=function(which,cb)
    {
        if(!this._eventCallbacks[which]) this._eventCallbacks[which]=[cb];
            else this._eventCallbacks[which].push(cb);
    }

    CABLES.Op.prototype.hasEventListener=function(which,cb)
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
    CABLES.Op.prototype.removeEventListener=function(which,cb)
    {
        if(this._eventCallbacks[which])
        {
            var idx=this._eventCallbacks[which].indexOf(cb);
            if(idx==-1) console.log("eventlistener "+which+" not found...");
            else this._eventCallbacks[which].slice(idx);
        }
    }

    CABLES.Op.prototype.fireEvent=function(which,params)
    {
        if(this._eventCallbacks[which])
            for(var i=0;i<this._eventCallbacks[which].length;i++)
                if(this._eventCallbacks[which][i])this._eventCallbacks[which][i](params);

        if(this.onUiAttrChange && which=="onUiAttribsChange") this.onUiAttrChange(params); // todo: use normal eventlistener
    }

    /**
     * @function
     * @description enable/disable op
     * @param {boolean} 
     */
    CABLES.Op.prototype.setEnabled=function(b)
    {
        this.enabled=b;
        this.fireEvent('onEnabledChange',b);
        // if(this._eventCallbacks.onEnabledChange)this._eventCallbacks.onEnabledChange(b);
    }

    /**
     * @function
     * @description organize ports into a group
     * @param {String} name
     * @param {Array} ports
     */
    CABLES.Op.prototype.setPortGroup=function(name,ports)
    {
        for (var i = 0; i < ports.length; i++)
            if (ports[i] && ports[i].setUiAttribs) ports[i].setUiAttribs({ "group": name });
                else
                {
                    console.error('setPortGroup: invalid port!');
                }
    }

    CABLES.Op.prototype.setUiAxisPorts=function(px,py,pz)
    {
        if(px) px.setUiAttribs({"axis":"X"})
        if(py) py.setUiAttribs({"axis":"Y"})
        if(pz) pz.setUiAttribs({"axis":"Z"})
    }


    /**
     * @function
     * @description remove port from op
     * @param {CABLES.Port} port to remove
     */
    CABLES.Op.prototype.removePort=function(port)
    {
        // for(var ipi in this.portsIn)
        for(var ipi=0;ipi<this.portsIn.length;ipi++)
        {
            if(this.portsIn[ipi]==port)
            {
                this.portsIn.splice(ipi, 1);
                this.fireEvent("onUiAttribsChange",{});
                this.fireEvent("onPortRemoved",{});
                return;
            }
        }
    }

    // needs to be in UI only
    CABLES.Op.prototype.checkLinkTimeWarnings=function()
    {
        function hasParent(op, type,name)
        {
            for(var i=0;i<op.portsIn.length;i++)
            {
                if (op.portsIn[i].type ==type &&  op.portsIn[i].isLinked())
                {
                    var pi=op.portsIn[i];
                    for(var li=0;li<pi.links.length;li++)
                    {
                        if(!pi.links[li])continue;
                        if(pi.links[li].portOut.parent.objName.indexOf(name)>-1) return true;
                            else if (hasParent(pi.links[li].portOut.parent,type,name)) return true;
                    }
                }
            }
            return false;
        }

        function hasTriggerInput(op)
        {
            if (op.portsIn.length>0 && op.portsIn[0].type==CABLES.OP_PORT_TYPE_FUNCTION )return true;
            return false;
        }

        var notWorkingMsg=null;
        var working=true;

        if (working && this.objName.indexOf('Ops.Gl.TextureEffects') == 0 && hasTriggerInput(this) && this.objName.indexOf('TextureEffects.ImageCompose')==-1)
        {
            working = hasParent(this, CABLES.OP_PORT_TYPE_FUNCTION, 'TextureEffects.ImageCompose');
            if (!working) notWorkingMsg = CABLES.UI.TEXTS.working_connected_to + 'ImageCompose';
        }
        // else
        // {
        //     if(!this.uiAttribs.subPatch) // todo: real subpatch check at one point!
        //     {
        //         if(this.objName.indexOf('Ops.Gl') == 0 && hasTriggerInput(this) && this.objName != 'Ops.Gl.MainLoop')
        //         {
        //             var iscon = hasParent(this, CABLES.OP_PORT_TYPE_FUNCTION, 'Ops.Gl.MainLoop');
        //             working = iscon;
        //             if (!iscon) notWorkingMsg = CABLES.UI.TEXTS.working_connected_to + 'Ops.Gl.MainLoop';
        //         }
        //     }
        // }


        if (this._needsParentOp && working)
        {
            working = hasParent(this, CABLES.OP_PORT_TYPE_OBJECT,this._needsParentOp);
            if (!working) notWorkingMsg = CABLES.UI.TEXTS.working_connected_to + this._needsParentOp;
        }

        if (this._needsLinkedToWork.length>0)
        {
            for (var i = 0; i < this._needsLinkedToWork.length; i++) {
                var p = this._needsLinkedToWork[i];
                if (!p) {
                    console.warn('[needsLinkedToWork] port not found');
                    continue;
                }
                if (!p.isLinked()) {
                    working = false;

                    if (!notWorkingMsg) notWorkingMsg = CABLES.UI.TEXTS.working_connected_needs_connections_to;
                        else notWorkingMsg += ', ';
                    notWorkingMsg += '' + p.name.toUpperCase() + '';
                }
            }
        }


        if (!working) this.setUiAttrib({ "working": working, "notWorkingMsg": notWorkingMsg });
            else if (!this.uiAttribs.working) this.setUiAttrib({ "working": true,"notWorkingMsg":null});

    }
    

    CABLES.Op.prototype._checkLinksNeededToWork=function()
    {
    }

    
    CABLES.Op.prototype.toWorkNeedsParent = function (parentOpName)
    {
        if (!CABLES.UI) return;
        this._needsParentOp=parentOpName;

    }

    CABLES.Op.prototype.toWorkPortsNeedToBeLinked = function ()
    {
        if (!CABLES.UI) return;
        for (var i = 0; i < arguments.length; i++)
            if(this._needsLinkedToWork.indexOf(arguments[i])==-1)
                this._needsLinkedToWork.push(arguments[i]);
    }
    CABLES.Op.prototype.toWorkPortsNeedToBeLinkedReset = function ()
    {
        if (!CABLES.UI) return;
        this._needsLinkedToWork.length=0;
        this.checkLinkTimeWarnings();
    }


}

/**
 * Returns an op category for the op.
 * @param {string} opName - The (full) name of the op, e.g. "Ops.Value"
 * @returns {string} - The op category
 */
CABLES.Op.getNamespaceClassName = function(opName) {
    if(!opName) return 'default';
    if( opName.startsWith('Ops.Gl') ) return 'gl';
    if( opName.startsWith('Ops.WebAudio') ) return 'audio';
    if( opName.startsWith('Ops.Devices') ) return 'devices';
    if( opName.startsWith('Ops.Html') ) return 'html';
    if( opName.startsWith('Ops.Sidebar') ) return 'html';
    if( opName.startsWith('Ops.Math') ) return 'math';
    if( opName.startsWith('Ops.User') ) return 'user';
    return 'default';
};


CABLES.Op.isSubpatchOp=function(name)
{
    return (name=='Ops.Ui.Patch' || name=='Ops.Ui.SubPatch');
};




// var Op=CABLES.Op; 
