
var OP_PORT_TYPE_VALUE =0;
var OP_PORT_TYPE_FUNCTION =1;
var OP_PORT_TYPE_OBJECT =2;
var OP_PORT_TYPE_TEXTURE =2;
var OP_PORT_TYPE_ARRAY =3;
var OP_PORT_TYPE_DYNAMIC=4;

var Ops = {};
var CABLES=CABLES || {};

CABLES.Op = function()
{
    this.objName='';
    this.portsOut=[];
    this.portsIn=[];
    this.uiAttribs={};
    this.enabled=true;
    this.patch=arguments[0];
    this.name=arguments[1] || 'unknown';
    this.id=generateUUID();
    this.onAddPort=null;
    this.onCreate=null;
    this.onResize=null;
    this.onLoaded=null;
    this.onDelete=null;
    this.onUiAttrChange=null;
    var _self=this;

    this.uiAttr=function(newAttribs)
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

    this.getName=function()
    {
        return this.name;
    };

    this.addOutPort=function(p)
    {
        p.direction=PORT_DIR_OUT;
        p.parent=this;
        this.portsOut.push(p);
        if(this.onAddPort)this.onAddPort(p);
        return p;
    };

    this.hasPort=function(name)
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


    this.hasDynamicPort=function()
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

    this.addInPort=function(p)
    {
        p.direction=PORT_DIR_IN;
        p.parent=this;
        this.portsIn.push(p);
        if(this.onAddPort)this.onAddPort(p);
        return p;
    };

    this.printInfo=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
             console.log('in: '+this.portsIn[i].getName());

        for(var ipo in this.portsOut)
             console.log('out: '+this.portsOut[ipo].getName());
    };

    this.markChilds=function()
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

    this.deleteChilds=function()
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

    this.removeLinks=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
            this.portsIn[i].removeLinks();

        for(var ipo in this.portsOut)
            this.portsOut[ipo].removeLinks();
    };


    this.findFittingPort=function(otherPort)
    {
        for(var ipo in this.portsOut)
            if(CABLES.Link.canLink(otherPort,this.portsOut[ipo]))return this.portsOut[ipo];

        for(var ipi in this.portsIn)
            if(CABLES.Link.canLink(otherPort,this.portsIn[ipi]))return this.portsIn[ipi];
    };

    this.getSerialized=function()
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
            if(this.portsIn[i].type!=OP_PORT_TYPE_DYNAMIC)
            op.portsIn.push( this.portsIn[i].getSerialized() );
        }

        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].type!=OP_PORT_TYPE_DYNAMIC)
                op.portsOut.push( this.portsOut[ipo].getSerialized() );

        return op;
    };

    this.getFistOutPortByType=function(type)
    {
        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].type==type)return this.portsOut[ipo];
    };

    this.getPortByName=function(name)
    {
        for(var ipi in this.portsIn)
            if(this.portsIn[ipi].getName()==name)return this.portsIn[ipi];

        for(var ipo in this.portsOut)
            if(this.portsOut[ipo].getName()==name)return this.portsOut[ipo];
    };

    this.getPort=function(name)
    {
        return this.getPortByName(name);
    };

    this.updateAnims=function()
    {
        for(var i=0;i<this.portsIn.length;i++)
        {
            this.portsIn[i].updateAnim();
        }
    };

    this.log=function(txt)
    {
        if(!this.patch.silent) console.log('['+(this.getName())+'] '+txt);
    };

    this.unLinkShake=function()
    {
        var reLinkP1=null;
        var reLinkP2=null;
        var tryRelink=true;
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

        for(var ipi in this.portsIn) this.portsIn[ipi].removeLinks();
        for(var ipo in this.portsOut) this.portsOut[ipo].removeLinks();

        if(reLinkP1 && reLinkP2)
        {
            this.patch.link(
                reLinkP1.parent,
                reLinkP1.getName(),
                reLinkP2.parent,
                reLinkP2.getName()
                );
        }
    };

    this.profile=function(enable)
    {
        for(var ipi in this.portsIn)
        {
            this.portsIn[ipi]._onTriggered=this.portsIn[ipi]._onTriggeredProfiling;
        }
    };

    this.findParent=function(objName)
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


};

var Op=CABLES.Op; // deprecated!
