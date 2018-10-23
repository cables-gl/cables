/**
 * @name Link
 * @memberof CABLES
 * @description a link is a connection between two ops/ports -> one input and one output port
 * @class
 */

var CABLES=CABLES || {};

CABLES.Link = function(scene)
{
    this.portIn=null;
    this.portOut=null;
    this.scene=scene; // todo: make private and rename to patch
    this.activityCounter=0;
};


CABLES.Link.prototype.setValue=function(v)
{
    if(v===undefined) this._setValue();
        else this.portIn.set(v);
};

CABLES.Link.prototype.activity=function()
{
    this.activityCounter++;
    // if(Date.now()-this.lastTime>100)
    // {
    //     // this.lastTime=Date.now();
    //     // this.changesPerSecond=this.changesCounter*10;
    //     this.changesCounter=0;
    // }

};


CABLES.Link.prototype._setValue=function()
{
    if(!this.portOut)
    {
        this.remove();
        return;
    }
    var v=this.portOut.get();


    if(v==v)  // NaN is the only JavaScript value that is treated as unequal to itself
    {
        if(this.portIn.type!=OP_PORT_TYPE_FUNCTION)this.activity();

        if( this.portIn.get()!==v )
        {
            this.portIn.set(v);
        }
        else
        {
            if(this.portIn.changeAlways) this.portIn.set(v);
        }
    }
};

/**
 * @name CABLES.Link#getOtherPort
 * @function
 * @param {CABLES.Port} port
 * @description returns the port of the link, which is not port
 */
CABLES.Link.prototype.getOtherPort=function(p)
{
    if(p==this.portIn)return this.portOut;
    return this.portIn;
};

/**
 * @name CABLES.Link#remove
 * @function
 * @description unlink/remove this link from all ports
 */
CABLES.Link.prototype.remove=function()
{
    if(this.portIn)this.portIn.removeLink(this);
    if(this.portOut)this.portOut.removeLink(this);
    if(this.scene)this.scene.onUnLink(this.portIn,this.portOut);

    if(this.portIn && this.portIn.type==OP_PORT_TYPE_OBJECT)
        this.portIn.set(null);

    this.portIn=null;
    this.portOut=null;
    this.scene=null;
};

/**
 * @function
 * @name CABLES.Link#link
 * @description link those two ports
 * @param {CABLES.Port} port1
 * @param {CABLES.Port} port2
 */
CABLES.Link.prototype.link=function(p1,p2)
{
    if(!CABLES.Link.canLink(p1,p2))
    {
        console.log('cannot link ports!');
        return false;
    }

    if(p1.direction==CABLES.PORT_DIR_IN)
    {
        this.portIn=p1;
        this.portOut=p2;
    }
    else
    {
        this.portIn=p2;
        this.portOut=p1;
    }

    p1.addLink(this);
    p2.addLink(this);

    this.setValue();

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

// --------------------------------------------

/**
 * @function
 * @name CABLES.Link#canLinkText
 * @description return a text message with human readable reason if ports can not be linked, or can be
 * @param {CABLES.Port} port1
 * @param {CABLES.Port} port2
 */
CABLES.Link.canLinkText=function(p1,p2)
{
    if(p1.direction==p2.direction)
    {
        var txt='(out)';
        if(p2.direction==CABLES.PORT_DIR_IN)txt="(in)";
        return 'can not link: same direction'+txt;
    }
    if(p1.parent==p2.parent)return 'can not link: same op';
    if( p1.type!=OP_PORT_TYPE_DYNAMIC && p2.type!=OP_PORT_TYPE_DYNAMIC )
    {
        if(p1.type!=p2.type)return 'can not link: different type';
    }

    if(!p1)return 'can not link: port 1 invalid';
    if(!p2)return 'can not link: port 2 invalid';


    if(p1.direction==CABLES.PORT_DIR_IN && p1.isAnimated())return 'can not link: is animated';
    if(p2.direction==CABLES.PORT_DIR_IN && p2.isAnimated())return 'can not link: is animated';

    // if(p1.direction==CABLES.PORT_DIR_IN && p1.links.length>0)return 'input port already busy';
    // if(p2.direction==CABLES.PORT_DIR_IN && p2.links.length>0)return 'input port already busy';
    if(p1.isLinkedTo(p2))return 'ports already linked';

    if( (p1.canLink && !p1.canLink(p2)) || p2.canLink && !p2.canLink(p1) )return 'Incompatible';

    return 'can link';
};

/**
 * @function
 * @name CABLES.Link#canLink
 * @description return true if ports can be linked
 * @param {CABLES.Port} port1
 * @param {CABLES.Port} port2
 */
CABLES.Link.canLink=function(p1,p2)
{
    if(!p1)return false;
    if(!p2)return false;
    if(p1.direction==CABLES.PORT_DIR_IN && p1.isAnimated())return false;
    if(p2.direction==CABLES.PORT_DIR_IN && p2.isAnimated())return false;

    if(p1.isHidden() || p2.isHidden())return false;

    if(p1.isLinkedTo(p2))return false;

    if(p1.direction==p2.direction)return false;
    
    if( (p1.type!=p2.type) && ( p1.type!=OP_PORT_TYPE_DYNAMIC && p2.type!=OP_PORT_TYPE_DYNAMIC )) return false;
    if(p1.type==OP_PORT_TYPE_DYNAMIC || p2.type==OP_PORT_TYPE_DYNAMIC )return true;
    
    if(p1.parent==p2.parent)return false;


    if(p1.canLink && !p1.canLink(p2))return false;
    if(p2.canLink && !p2.canLink(p1))return false;

    

    return true;
};
