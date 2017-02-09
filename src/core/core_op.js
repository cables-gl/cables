
var OP_PORT_TYPE_VALUE =0;
var OP_PORT_TYPE_FUNCTION =1;
var OP_PORT_TYPE_OBJECT =2;
var OP_PORT_TYPE_TEXTURE =2;
var OP_PORT_TYPE_ARRAY =3;
var OP_PORT_TYPE_DYNAMIC=4;

var Ops = {};
var CABLES=CABLES || {};

CABLES.Helpers = CABLES.Helpers || {};
CABLES.Helpers.isArray = function(v) {return Object.prototype.toString.call(v) === '[object Array]';};

CABLES.Op = function()
{
    this.objName='';
    this.portsOut=[];
    this.portsIn=[];
    this.uiAttribs={};
    this.enabled=true;
    this.patch=arguments[0];
    this.name=arguments[1] || 'unknown';
    this.id=CABLES.generateUUID();
    this.onAddPort=null;
    this.onCreate=null;
    this.onResize=null;
    this.onLoaded=null;
    this.onDelete=null;
    this.onUiAttrChange=null;
};
{

    CABLES.Op.prototype.clearUiAttrib=function(name)
    {
        var obj={};
        obj.name=null;
        this.uiAttrib(obj);
    };

    CABLES.Op.prototype.setUiAttrib=CABLES.Op.prototype.uiAttr=function(newAttribs)
    {
        if(newAttribs && newAttribs.error)
        {
            console.error('error:',this.name,newAttribs.error);
        }

        if(!this.uiAttribs)this.uiAttribs={};
        for(var p in newAttribs)
        {
            this.uiAttribs[p]=newAttribs[p];
        }
        if(this.onUiAttrChange) this.onUiAttrChange();
    };

    CABLES.Op.prototype.getName=function()
    {
        return this.name;
    };

    CABLES.Op.prototype.addOutPort=function(p)
    {
        p.direction=PORT_DIR_OUT;
        p.parent=this;
        this.portsOut.push(p);
        if(this.onAddPort)this.onAddPort(p);
        return p;
    };

    CABLES.Op.prototype.hasPort=function(name)
    {
        for(var i in this.portsIn)
        {
            if(this.portsIn[i].getName()==name)
            {
                return true;
            }
        }
        return false;
    };

    CABLES.Op.prototype.hasDynamicPort=function()
    {
        var i=0;
        for(i in this.portsIn)
        {
            if(this.portsIn[i].type==OP_PORT_TYPE_DYNAMIC) return true;
            if(this.portsIn[i].getName()=='dyn') return true;
        }
        for(i in this.portsOut)
        {
            if(this.portsOut[i].type==OP_PORT_TYPE_DYNAMIC) return true;
            if(this.portsOut[i].getName()=='dyn') return true;
        }

        return false;
    };

    CABLES.Op.prototype.addInPort=function(p)
    {
        p.direction=PORT_DIR_IN;
        p.parent=this;
        this.portsIn.push(p);
        if(this.onAddPort)this.onAddPort(p);
        return p;
    };

    CABLES.Op.prototype.inFunction=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_FUNCTION)); if(v!==undefined)p.set(v); return p; };

    CABLES.Op.prototype.inFunctionButton=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_FUNCTION,{"display":"button"})); if(v!==undefined)p.set(v); return p; };



    CABLES.Op.prototype.inValue=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE)); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };
    CABLES.Op.prototype.inValueBool=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE,{"display":"bool"})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };
    CABLES.Op.prototype.inValueString=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE,{"type":"string"})); p.value=''; if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };
    CABLES.Op.prototype.inValueSelect=function(name,values,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE,{"display":'dropdown',"hidePort":true,values:values})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };

    CABLES.Op.prototype.inValueInt=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE)); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };


    CABLES.Op.prototype.inFile=function(name,filter,v){var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE,{"display":"file","filter":filter})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };



    // CABLES.Op.prototype.inTexture=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_OBJECT,{"preview":true}));  p.ignoreValueSerialize=true; return p; };
    CABLES.Op.prototype.inTexture=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_OBJECT,{"preview":true})); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.inObject=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_OBJECT)); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.inArray=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_ARRAY)); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.inValueSlider=function(name,v){ var p=this.addInPort(new Port(this,name,OP_PORT_TYPE_VALUE,{display:'range'})); if(v!==undefined){ p.set(v); p.defaultValue=v;} return p; };


    CABLES.Op.prototype.outFunction=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_FUNCTION)); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.outValue=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_VALUE)); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.outValueBool=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_VALUE,{"display":"bool"})); if(v!==undefined)p.set(v);else p.set(false); return p; };
    CABLES.Op.prototype.outValueString=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_VALUE)); if(v!==undefined)p.set(v); return p; };
    CABLES.Op.prototype.outObject=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_OBJECT)); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };
    CABLES.Op.prototype.outArray=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_ARRAY)); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };
    CABLES.Op.prototype.outTexture=function(name,v){ var p=this.addOutPort(new Port(this,name,OP_PORT_TYPE_OBJECT,{"preview":true})); if(v!==undefined)p.set(v); p.ignoreValueSerialize=true; return p; };




    CABLES.Op.prototype.inDynamic=
        function(name,filter,options,v){
            var p=new Port(this,name,OP_PORT_TYPE_DYNAMIC,options);

            p.shouldLink=function(p1,p2)
            {
              if(filter && CABLES.Helpers.isArray(filter))
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
        op.objName=this.objName;
        op.id=this.id;
        op.uiAttribs=this.uiAttribs;
        op.portsIn=[];
        op.portsOut=[];

        for(var i=0;i<this.portsIn.length;i++)
        {
            // if(this.portsIn[i].type!=OP_PORT_TYPE_DYNAMIC)
                op.portsIn.push( this.portsIn[i].getSerialized() );
        }

        for(var ipo in this.portsOut)
            // if(this.portsOut[ipo].type!=OP_PORT_TYPE_DYNAMIC)
                op.portsOut.push( this.portsOut[ipo].getSerialized() );

        return op;
    };

    CABLES.Op.prototype.getFistOutPortByType=function(type)
    {
        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].type==type)return this.portsOut[ipo];
    };

    CABLES.Op.prototype.getPortByName=function(name)
    {
        for(var ipi in this.portsIn)
            if(this.portsIn[ipi].getName()==name)return this.portsIn[ipi];

        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].getName()==name)return this.portsOut[ipo];
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
        if(!this.patch.silent)
            Function.apply.call(console.log, console, arguments);
    };

    CABLES.Op.prototype.undoShake=function()
    {

        if(this.shakeLink)this.shakeLink.remove();

        console.log('undo shake...');
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

    CABLES.Op.prototype.unLinkShake=function()
    {
        var reLinkP1=null;
        var reLinkP2=null;
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
                    reLinkP1=this.portsIn[0].links[0].getOtherPort(this.portsIn[0]);
                    reLinkP2=this.portsOut[0].links[0].getOtherPort(this.portsOut[0]);
                }
            }
        }


        for(var ipi in this.portsIn)
        {
            for(i=0;i<this.portsIn[ipi].links.length;i++)
                this.oldLinks.push(
                    {
                        in:this.portsIn[ipi].links[i].portIn,
                        out:this.portsIn[ipi].links[i].portOut
                    });

            this.portsIn[ipi].removeLinks();
        }

        for(var ipo in this.portsOut)
        {
            for(i=0;i<this.portsOut[ipo].links.length;i++)
                this.oldLinks.push(
                    {
                        in:this.portsOut[ipo].links[i].portIn,
                        out:this.portsOut[ipo].links[i].portOut
                    });

            this.portsOut[ipo].removeLinks();
        }



        if(reLinkP1 && reLinkP2)
        {
            this.shakeLink=this.patch.link(
                reLinkP1.parent,
                reLinkP1.getName(),
                reLinkP2.parent,
                reLinkP2.getName()
                );

        }


    };

    CABLES.Op.prototype.profile=function(enable)
    {
        for(var ipi in this.portsIn)
            this.portsIn[ipi]._onTriggered=this.portsIn[ipi]._onTriggeredProfiling;
    };

    CABLES.Op.prototype.findParent=function(objName)
    {
        for(var ipi in this.portsIn)
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
}

CABLES.Op.isSubpatchOp=function(name)
{
    return (name=='Ops.Ui.Patch' || name=='Ops.Ui.SubPatch');
};

var Op=CABLES.Op; // deprecated!
