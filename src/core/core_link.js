
var CABLES=CABLES || {};

CABLES.Link = function(scene)
{
    this.portIn=null;
    this.portOut=null;
    this.scene=scene;
};

{
    CABLES.Link.prototype.setValue=function(v)
    {
        this.portIn.set(v);
    };

    CABLES.Link.prototype.setValue=function()
    {
        if(!this.portOut)
        {
            console.log('NO this.portOut !',this);
            this.remove();
            return;
        }
        var v=this.portOut.get();
        // if(v!=v)return;

        if(
            v==v &&  // NaN is the only JavaScript value that is treated as unequal to itself
            this.portIn.get()!=v
        )
        this.portIn.set(v);
    };

    CABLES.Link.prototype.getOtherPort=function(p)
    {
        if(p==this.portIn)return this.portOut;
        return this.portIn;
    };

    CABLES.Link.prototype.remove=function()
    {
        this.portIn.removeLink(this);
        this.portOut.removeLink(this);
        this.scene.onUnLink(this.portIn,this.portOut);
        this.portIn=null;
        this.portOut=null;
        this.scene=null;
    };

    CABLES.Link.prototype.link=function(p1,p2)
    {
        if(!CABLES.Link.canLink(p1,p2))
        {
            console.log('cannot link ports!');
            return false;
        }
        if(p1.direction==PORT_DIR_IN)
        {
            this.portIn=p1;
            this.portOut=p2;
        }
        else
        {
            this.portIn=p2;
            this.portOut=p1;
        }

        this.setValue();

        p1.addLink(this);
        p2.addLink(this);

        if(p1.onLink) p1.onLink(this);
        if(p2.onLink) p2.onLink(this);
    };

    CABLES.Link.prototype.getSerialized=function()
    {
        var obj={};

        obj.portIn=this.portIn.getName();
        obj.portOut=this.portOut.getName();
        obj.objIn=this.portIn.parent.id;
        obj.objOut=this.portOut.parent.id;

        return obj;
    };
}

// --------------------------------------------

CABLES.Link.canLinkText=function(p1,p2)
{
    if(p1.direction==p2.direction)
    {
        var txt='(out)';
        if(p2.direction==PORT_DIR_IN)txt="(in)";
        return 'can not link: same direction'+txt;
    }
    if(p1.parent==p2.parent)return 'can not link: same op';
    if( p1.type!=OP_PORT_TYPE_DYNAMIC && p2.type!=OP_PORT_TYPE_DYNAMIC )
    {
        if(p1.type!=p2.type)return 'can not link: different type';
    }

    if(!p1)return 'can not link: port 1 invalid';
    if(!p2)return 'can not link: port 2 invalid';

    if(p1.direction==PORT_DIR_IN && p1.isAnimated())return 'can not link: is animated';
    if(p2.direction==PORT_DIR_IN && p2.isAnimated())return 'can not link: is animated';

    if(p1.direction==PORT_DIR_IN && p1.links.length>0)return 'input port already busy';
    if(p2.direction==PORT_DIR_IN && p2.links.length>0)return 'input port already busy';
    if(p1.isLinkedTo(p2))return 'ports already linked';

    return 'can link';
};

CABLES.Link.canLink=function(p1,p2)
{
    if(!p1)return false;
    if(!p2)return false;
    if( p1.type==OP_PORT_TYPE_DYNAMIC || p2.type==OP_PORT_TYPE_DYNAMIC )return true;
    if(p1.direction==PORT_DIR_IN && p1.isAnimated())return false;
    if(p2.direction==PORT_DIR_IN && p2.isAnimated())return false;

    if(p1.direction==PORT_DIR_IN && p1.links.length>0)return false;
    if(p2.direction==PORT_DIR_IN && p2.links.length>0)return false;
    if(p1.isLinkedTo(p2))return false;
    if(p1.direction==p2.direction)return false;
    if(p1.type!=p2.type)return false;
    if(p1.parent==p2.parent)return false;

    return true;
};
