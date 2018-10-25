
var cgl=op.patch.cgl;

op.render=op.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var inStrength=op.inValue("Strength",1);
// var inSmooth=op.inValueBool("Smooth",true);


var scrollx=op.inValue("Scroll X");
var scrolly=op.inValue("Scroll Y");
var scrollz=op.inValue("Scroll Z");

var shader=null;

var inWorldSpace=op.inValueBool("WorldSpace");


var srcHeadVert=attachments.perlin_instposition_vert||'';


var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   pos=MOD_deform(instMat,pos);'
    .endl()+'#endif'
    
    .endl();

var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


op.render.onLinkChanged=removeModule;


inWorldSpace.onChange=updateWorldspace;

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define(moduleVert.prefix+"WORLDSPACE");
        else shader.removeDefine(moduleVert.prefix+"WORLDSPACE");
}


op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }
    
    // if(CABLES.UI && CABLES.UI.renderHelper)
    // {
    //     cgl.pushModelMatrix();
    //     mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[x.get(),y.get(),z.get()]);
    //     CABLES.GL_MARKER.drawSphere(op,inSize.get());
    //     cgl.popModelMatrix();
    // }


    // if(CABLES.UI && gui.patch().isCurrentOp(op)) 
    //     gui.setTransformGizmo(
    //         {
    //             posX:x,
    //             posY:y,
    //             posZ:z
    //         });

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

        // inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        // inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);
        // inScale.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);

        scrollx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollx',scrollx);
        scrolly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrolly',scrolly);
        scrollz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollz',scrollz);

        // x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        // y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        // z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        
        updateWorldspace();
    }
    
    
    if(!shader)return;

    op.trigger.trigger();
};













