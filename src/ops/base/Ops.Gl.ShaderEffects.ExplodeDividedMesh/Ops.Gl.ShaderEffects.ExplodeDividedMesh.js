
var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inDistance=op.inValue("Distance",1);
var inAbsolute=op.inValueBool("Absolute",false);

{
    var x=op.inValue("add x");
    var y=op.inValue("add y");
    var z=op.inValue("add z");

    var mulx=op.inValue("mul x",1);
    var muly=op.inValue("mul y",1);
    var mulz=op.inValue("mul z",1);

    var posx=op.inValue("x");
    var posy=op.inValue("y");
    var posz=op.inValue("z");
}

var inSize=op.inValue("Size",1);

var shader=null;

var srcHeadVert=attachments.explode_divided_mesh_vert;

var srcBodyVert=''
    .endl()+'pos=MOD_deform(pos,attrVertNormal,attrVertIndex);'
    .endl();
    
var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

var absoluteChanged=false;

inAbsolute.onChange=function()
{
    absoluteChanged=true;
};

op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }

    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:posx,
                posY:posy,
                posZ:posz
            });

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        inDistance.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'dist',inDistance);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);

        mulx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'mulx',mulx);
        muly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'muly',muly);
        mulz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'mulz',mulz);

        posx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'posx',posx);
        posy.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'posy',posy);
        posz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'posz',posz);

        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
    }
    
    if(absoluteChanged)
    {
        absoluteChanged=false;
        if(inAbsolute.get()) shader.define("ABSOLUTE");
            else shader.removeDefine("ABSOLUTE");

    }
    
    if(!shader)return;

    op.trigger.trigger();
};













